import express from "express";
import crypto from "crypto";
import { query, ensureDb, verifyPassword } from "./db.js";
import { crmEnabled, sendToCrm } from "./crm.js";

// Shared by server.ts (local dev / `npm start`) and api/index.js (Vercel function).
const app = express();
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.send("OK"));

// Database health check: reports the error code (never secrets) so setup problems are visible.
app.get("/api/health", async (_req, res) => {
  const configured = {
    DATABASE_URL: process.env.DATABASE_URL ? "set" : "missing",
    ADMIN_SECRET: process.env.ADMIN_SECRET ? "set" : "missing",
    CRM_WEBHOOK_URL: crmEnabled() ? "set" : "not set (optional)",
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? "set (only needed for the one-time copy)" : "not set",
  };
  try {
    await ensureDb();
    const [migration] = await query("SELECT value FROM settings WHERE key = 'migrated_from_turso'");
    res.json({
      db: "ok",
      migrated_from_turso: migration ? JSON.parse(migration.value) : false,
      configured,
    });
  } catch (err) {
    res.status(500).json({
      db: "error",
      code: err?.code ?? err?.name ?? "unknown",
      message: String(err?.message ?? err).replace(/\b[\w+.-]+:\/\/\S+/g, "<url>").slice(0, 200),
      configured,
    });
  }
});

// Make sure tables exist before any /api request touches the database.
app.use("/api", (_req, _res, next) => {
  ensureDb().then(() => next(), next);
});

// Wraps async handlers so a rejected promise reaches the error handler.
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

const text = (v, max = 5000) => (v == null || v === "" ? null : String(v).trim().slice(0, max));

// --- Admin auth: signed, expiring token (HMAC) ---

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const secret = () =>
  process.env.ADMIN_SECRET || process.env.DATABASE_URL || "local-dev-secret";
const sign = (payload) =>
  crypto.createHmac("sha256", secret()).update(payload).digest("base64url");

function makeToken(username) {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + TOKEN_TTL_MS }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  const [payload, sig] = token.split(".");
  let valid = false;
  try {
    const expected = payload ? sign(payload) : "";
    valid =
      !!sig &&
      sig.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) &&
      JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now();
  } catch {
    valid = false;
  }
  if (!valid) return res.status(401).json({ success: false, message: "Please sign in again" });
  next();
}

// --- Public content ---

app.get("/api/content/hero", wrap(async (_req, res) => {
  res.json(await query("SELECT * FROM hero_slides ORDER BY order_index ASC"));
}));

app.get("/api/content/services", wrap(async (_req, res) => {
  res.json(await query("SELECT * FROM services ORDER BY order_index ASC"));
}));

app.get("/api/content/jobs", wrap(async (_req, res) => {
  res.json(await query("SELECT * FROM jobs WHERE status = 'open'"));
}));

app.get("/api/content/testimonials", wrap(async (_req, res) => {
  res.json(await query("SELECT * FROM testimonials"));
}));

app.get("/api/content/blog", wrap(async (_req, res) => {
  res.json(await query("SELECT * FROM blog_posts ORDER BY published_at DESC"));
}));

// Logo saved from the Logo Enhancer (stored in the database; Vercel has no writable disk).
app.get("/api/logo", wrap(async (_req, res) => {
  const [row] = await query("SELECT value FROM settings WHERE key = 'logo'");
  const match = row?.value?.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
  if (!match) return res.redirect(302, "/logo.png");
  res.set("Content-Type", match[1]);
  res.set("Cache-Control", "public, max-age=300");
  res.send(Buffer.from(match[2], "base64"));
}));

// --- Form submissions ---

app.post("/api/forms/apply", wrap(async (req, res) => {
  const b = req.body ?? {};
  await query(
    "INSERT INTO applications (name, email, phone, profession, country, experience) VALUES ($1, $2, $3, $4, $5, $6)",
    [text(b.name, 200), text(b.email, 200), text(b.phone, 50), text(b.profession, 200), text(b.country, 100), text(b.experience)],
  );
  res.status(201).json({ message: "Application submitted successfully" });
}));

app.post("/api/forms/inquiry", wrap(async (req, res) => {
  const b = req.body ?? {};
  const lead = {
    name: text(b.name, 200),
    email: text(b.email, 200),
    phone: text(b.phone, 50),
    subject: text(b.subject, 200),
    message: text(b.message),
  };
  if (!lead.name || !lead.message || !(lead.email || lead.phone)) {
    return res.status(400).json({ message: "Please add your name, a message, and an email or phone number." });
  }
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return res.status(400).json({ message: "Please check your email address." });
  }
  const [row] = await query(
    "INSERT INTO inquiries (name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at",
    [lead.name, lead.email, lead.phone, lead.subject, lead.message],
  );
  // Forward to the CRM (if configured) before replying; serverless functions stop after the reply.
  if (await sendToCrm({ type: "inquiry", id: row.id, occurred_at: row.created_at, data: { ...lead, source: "website" } })) {
    await query("UPDATE inquiries SET crm_synced_at = now() WHERE id = $1", [row.id]);
  }
  res.status(201).json({ message: "Thank you! We'll get back to you shortly." });
}));

// WhatsApp button taps (sent with navigator.sendBeacon from the browser).
app.post("/api/track/whatsapp", wrap(async (req, res) => {
  const b = req.body ?? {};
  const source = text(b.source, 50) || "unknown";
  const page = text(b.page, 300);
  const [row] = await query(
    "INSERT INTO whatsapp_clicks (source, page) VALUES ($1, $2) RETURNING id, created_at",
    [source, page],
  );
  if (await sendToCrm({ type: "whatsapp_click", id: row.id, occurred_at: row.created_at, data: { source, page } })) {
    await query("UPDATE whatsapp_clicks SET crm_synced_at = now() WHERE id = $1", [row.id]);
  }
  res.status(204).end();
}));

// --- Admin ---

app.post("/api/admin/login", wrap(async (req, res) => {
  const { username, password } = req.body ?? {};
  const [user] = await query("SELECT username, password_hash FROM users WHERE username = $1", [String(username ?? "")]);
  if (user && verifyPassword(password ?? "", user.password_hash)) {
    res.json({ success: true, token: makeToken(user.username) });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
}));

app.get("/api/admin/inquiries", requireAdmin, wrap(async (_req, res) => {
  res.json(await query(
    "SELECT id, name, email, phone, subject, message, status, crm_synced_at, created_at FROM inquiries ORDER BY created_at DESC LIMIT 500",
  ));
}));

const INQUIRY_STATUSES = ["new", "contacted", "qualified", "won", "lost"];

app.patch("/api/admin/inquiries/:id", requireAdmin, wrap(async (req, res) => {
  const status = String(req.body?.status ?? "");
  if (!INQUIRY_STATUSES.includes(status)) return res.status(400).json({ message: "Unknown status" });
  const rows = await query("UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING id, status", [status, Number(req.params.id)]);
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
}));

app.get("/api/admin/whatsapp-stats", requireAdmin, wrap(async (_req, res) => {
  const [totals] = await query(`
    SELECT count(*)::int AS total,
           count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS last_7_days,
           count(*) FILTER (WHERE created_at > now() - interval '30 days')::int AS last_30_days
    FROM whatsapp_clicks`);
  const bySource = await query(
    "SELECT source, count(*)::int AS clicks FROM whatsapp_clicks GROUP BY source ORDER BY clicks DESC",
  );
  res.json({ ...totals, by_source: bySource });
}));

app.post("/api/admin/save-logo", requireAdmin, wrap(async (req, res) => {
  const { image } = req.body ?? {};
  if (typeof image !== "string" || !/^data:image\/[\w.+-]+;base64,/.test(image)) {
    return res.status(400).send("No image provided");
  }
  await query(
    "INSERT INTO settings (key, value) VALUES ('logo', $1) ON CONFLICT (key) DO UPDATE SET value = excluded.value",
    [image],
  );
  res.json({ success: true });
}));

app.use("/api", (_req, res) => res.status(404).json({ message: "Not found" }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

export default app;
