import express from "express";
import crypto from "crypto";
import { db, ensureDb } from "./db.js";

// Shared by server.ts (local dev / `npm start`) and api/index.js (Vercel function).
const app = express();
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.send("OK"));

// Database health check: reports the error code (never secrets) so setup problems are visible.
app.get("/api/health", async (_req, res) => {
  const configured = {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL
      ? process.env.TURSO_DATABASE_URL.split("://")[0] + "://…"
      : "missing",
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? "set" : "missing",
    ADMIN_SECRET: process.env.ADMIN_SECRET ? "set" : "missing",
  };
  try {
    await ensureDb();
    await db.execute("SELECT 1");
    res.json({ db: "ok", configured });
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
const wrap =
  (fn) =>
  (req, res, next) =>
    fn(req, res).catch(next);

// --- Admin auth: signed, expiring token (HMAC) instead of a fixed "mock-token" ---

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const secret = () =>
  process.env.ADMIN_SECRET || process.env.TURSO_AUTH_TOKEN || "local-dev-secret";
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
  const expected = payload ? sign(payload) : "";
  const valid =
    !!sig &&
    sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) &&
    JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now();
  if (!valid) return res.status(401).json({ success: false, message: "Please sign in again" });
  next();
}

// --- Public content ---

app.get("/api/content/hero", wrap(async (_req, res) => {
  const r = await db.execute("SELECT * FROM hero_slides ORDER BY order_index ASC");
  res.json(r.rows);
}));

app.get("/api/content/services", wrap(async (_req, res) => {
  const r = await db.execute("SELECT * FROM services ORDER BY order_index ASC");
  res.json(r.rows);
}));

app.get("/api/content/jobs", wrap(async (_req, res) => {
  const r = await db.execute("SELECT * FROM jobs WHERE status = 'open'");
  res.json(r.rows);
}));

app.get("/api/content/testimonials", wrap(async (_req, res) => {
  const r = await db.execute("SELECT * FROM testimonials");
  res.json(r.rows);
}));

app.get("/api/content/blog", wrap(async (_req, res) => {
  const r = await db.execute("SELECT * FROM blog_posts ORDER BY published_at DESC");
  res.json(r.rows);
}));

// Logo saved from the Logo Enhancer (stored in the database; Vercel has no writable disk).
app.get("/api/logo", wrap(async (_req, res) => {
  const r = await db.execute({ sql: "SELECT value FROM settings WHERE key = ?", args: ["logo"] });
  const value = r.rows[0]?.value;
  const match = value?.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
  if (!match) return res.redirect(302, "/logo.png");
  res.set("Content-Type", match[1]);
  res.set("Cache-Control", "public, max-age=300");
  res.send(Buffer.from(match[2], "base64"));
}));

// --- Form submissions ---

app.post("/api/forms/apply", wrap(async (req, res) => {
  const { name, email, phone, profession, country, experience } = req.body;
  await db.execute({
    sql: "INSERT INTO applications (name, email, phone, profession, country, experience) VALUES (?, ?, ?, ?, ?, ?)",
    args: [name ?? null, email ?? null, phone ?? null, profession ?? null, country ?? null, experience ?? null],
  });
  res.status(201).json({ message: "Application submitted successfully" });
}));

app.post("/api/forms/inquiry", wrap(async (req, res) => {
  const { name, email, subject, message } = req.body;
  await db.execute({
    sql: "INSERT INTO inquiries (name, email, subject, message) VALUES (?, ?, ?, ?)",
    args: [name ?? null, email ?? null, subject ?? null, message ?? null],
  });
  res.status(201).json({ message: "Inquiry submitted successfully" });
}));

// --- Admin ---

app.post("/api/admin/login", wrap(async (req, res) => {
  const { username, password } = req.body;
  const r = await db.execute({
    sql: "SELECT username FROM users WHERE username = ? AND password = ?",
    args: [username ?? "", password ?? ""],
  });
  if (r.rows.length) {
    res.json({ success: true, token: makeToken(String(r.rows[0].username)) });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
}));

app.post("/api/admin/save-logo", requireAdmin, wrap(async (req, res) => {
  const { image } = req.body;
  if (typeof image !== "string" || !/^data:image\/[\w.+-]+;base64,/.test(image)) {
    return res.status(400).send("No image provided");
  }
  await db.execute({
    sql: "INSERT INTO settings (key, value) VALUES ('logo', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    args: [image],
  });
  res.json({ success: true });
}));

app.use("/api", (_req, res) => res.status(404).json({ message: "Not found" }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

export default app;
