import express from "express";
import crypto from "crypto";
import { query, ensureDb, verifyPassword, hashPassword } from "./db.js";
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
  req.admin = JSON.parse(Buffer.from(payload, "base64url").toString()).u;
  next();
}

// --- Public content ---

app.get("/api/content/hero", wrap(async (_req, res) => {
  res.json(await query("SELECT * FROM hero_slides ORDER BY order_index ASC"));
}));

app.get("/api/content/services", wrap(async (_req, res) => {
  res.json(await query("SELECT * FROM services ORDER BY order_index ASC"));
}));

const PUBLIC_JOB_COLUMNS = "id, title, country, industry, job_type, salary, description, requirements, deadline, created_at";

app.get("/api/content/jobs", wrap(async (_req, res) => {
  res.json(await query(`SELECT ${PUBLIC_JOB_COLUMNS} FROM jobs WHERE status = 'open' ORDER BY created_at DESC, id DESC`));
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

// --- Admin content editing (jobs, hero slides) ---
// Each resource lists the only columns the admin may write; values are trimmed text
// (or integers where noted), so nothing else in the request reaches the database.
const RESOURCES = {
  jobs: {
    table: "jobs",
    order: "created_at DESC, id DESC",
    fields: {
      title: { required: true, max: 200 },
      country: { max: 120 },
      industry: { max: 120 },
      job_type: { max: 60 },
      salary: { max: 120 },
      deadline: { max: 60 },
      description: { max: 5000 },
      requirements: { max: 5000 },
      status: { oneOf: ["open", "closed"], default: "open" },
    },
  },
  "hero-slides": {
    table: "hero_slides",
    order: "order_index ASC, id ASC",
    fields: {
      title: { required: true, max: 200 },
      subtitle: { max: 600 },
      video_url: { max: 1000, url: true },
      cta_text: { max: 60 },
      cta_link: { max: 300 },
      order_index: { int: true, default: 0 },
    },
  },
};

function cleanFields(spec, body, { partial }) {
  const out = {};
  for (const [key, rule] of Object.entries(spec.fields)) {
    if (!(key in body)) {
      if (!partial && rule.default !== undefined) out[key] = rule.default;
      if (!partial && rule.required) throw Object.assign(new Error(`${key} is required`), { status: 400 });
      continue;
    }
    let v = body[key];
    if (rule.int) {
      v = v === "" || v == null ? rule.default ?? null : Number.parseInt(v, 10);
      if (v !== null && !Number.isFinite(v)) throw Object.assign(new Error(`${key} must be a number`), { status: 400 });
    } else {
      v = text(v, rule.max);
      if (rule.oneOf && !rule.oneOf.includes(v)) throw Object.assign(new Error(`${key} must be one of ${rule.oneOf.join(", ")}`), { status: 400 });
      if (rule.url && v && !/^https?:\/\//i.test(v)) throw Object.assign(new Error(`${key} must start with http:// or https://`), { status: 400 });
    }
    if (rule.required && !v) throw Object.assign(new Error(`${key} is required`), { status: 400 });
    out[key] = v;
  }
  return out;
}

function resourceFor(req, res) {
  const spec = RESOURCES[req.params.resource];
  if (!spec) res.status(404).json({ message: "Not found" });
  return spec;
}

app.get("/api/admin/:resource(jobs|hero-slides)", requireAdmin, wrap(async (req, res) => {
  const spec = resourceFor(req, res);
  res.json(await query(`SELECT * FROM ${spec.table} ORDER BY ${spec.order}`));
}));

app.post("/api/admin/:resource(jobs|hero-slides)", requireAdmin, wrap(async (req, res) => {
  const spec = resourceFor(req, res);
  const data = cleanFields(spec, req.body ?? {}, { partial: false });
  const cols = Object.keys(data);
  const [row] = await query(
    `INSERT INTO ${spec.table} (${cols.join(", ")}) VALUES (${cols.map((_, i) => "$" + (i + 1)).join(", ")}) RETURNING *`,
    cols.map((c) => data[c]),
  );
  res.status(201).json(row);
}));

app.put("/api/admin/:resource(jobs|hero-slides)/:id", requireAdmin, wrap(async (req, res) => {
  const spec = resourceFor(req, res);
  const data = cleanFields(spec, req.body ?? {}, { partial: true });
  const cols = Object.keys(data);
  if (!cols.length) return res.status(400).json({ message: "Nothing to update" });
  const rows = await query(
    `UPDATE ${spec.table} SET ${cols.map((c, i) => `${c} = $${i + 1}`).join(", ")} WHERE id = $${cols.length + 1} RETURNING *`,
    [...cols.map((c) => data[c]), Number(req.params.id)],
  );
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
}));

app.delete("/api/admin/:resource(jobs|hero-slides|inquiries)/:id", requireAdmin, wrap(async (req, res) => {
  const table = { jobs: "jobs", "hero-slides": "hero_slides", inquiries: "inquiries" }[req.params.resource];
  const rows = await query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [Number(req.params.id)]);
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.status(204).end();
}));

// --- Admin account ---

app.post("/api/admin/change-password", requireAdmin, wrap(async (req, res) => {
  const { currentPassword, newPassword, newUsername } = req.body ?? {};
  const [user] = await query("SELECT id, username, password_hash FROM users WHERE username = $1", [req.admin]);
  if (!user || !verifyPassword(currentPassword ?? "", user.password_hash)) {
    return res.status(400).json({ message: "Your current password is not correct." });
  }
  const pw = String(newPassword ?? "");
  if (pw.length < 10) return res.status(400).json({ message: "Use at least 10 characters for the new password." });
  if (pw === currentPassword) return res.status(400).json({ message: "The new password must be different from the current one." });
  const name = text(newUsername, 60) || user.username;
  if (!/^[\w.@-]{3,60}$/.test(name)) return res.status(400).json({ message: "Usernames can use letters, numbers, dots, dashes, @ and _ (3–60 characters)." });
  try {
    await query("UPDATE users SET username = $1, password_hash = $2 WHERE id = $3", [name, hashPassword(pw), user.id]);
  } catch (err) {
    if (err?.code === "23505") return res.status(400).json({ message: "That username is already taken." });
    throw err;
  }
  // Return a fresh token for the (possibly renamed) account.
  res.json({ success: true, username: name, token: makeToken(name) });
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
  if (err?.status === 400) return res.status(400).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

export default app;
