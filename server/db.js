import crypto from 'crypto';

// Database: Postgres on Supabase in production (DATABASE_URL), or an in-process
// Postgres (PGlite, stored in ./.pgdata) for local development. Same SQL for both.
const DATABASE_URL = process.env.DATABASE_URL;

let backendPromise = null;

async function createBackend() {
  if (DATABASE_URL) {
    const { default: postgres } = await import('postgres');
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(DATABASE_URL);
    // prepare:false keeps it compatible with Supabase's connection pooler (port 6543).
    const sql = postgres(DATABASE_URL, {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      ssl: local ? false : 'require',
    });
    const wrap = (s) => ({
      query: async (text, params = []) => [...(await s.unsafe(text, params))],
      exec: async (text) => { await s.unsafe(text); },
    });
    return { ...wrap(sql), tx: (fn) => sql.begin((s) => fn(wrap(s))) };
  }

  if (process.env.VERCEL) {
    throw new Error('DATABASE_URL is not set for this Vercel environment');
  }

  // Not a literal import, so Vercel's bundler doesn't ship PGlite with the function.
  const pgliteModule = '@electric-sql/pglite';
  const { PGlite } = await import(pgliteModule);
  const pg = new PGlite(process.env.PGLITE_DIR || './.pgdata');
  const wrap = (s) => ({
    query: async (text, params = []) => (await s.query(text, params)).rows,
    exec: async (text) => { await s.exec(text); },
  });
  return { ...wrap(pg), tx: (fn) => pg.transaction((t) => fn(wrap(t))) };
}

function backend() {
  if (!backendPromise) {
    backendPromise = createBackend().catch((err) => { backendPromise = null; throw err; });
  }
  return backendPromise;
}

/** Runs one SQL statement with $1, $2… parameters and returns the rows. */
export async function query(text, params = []) {
  return (await backend()).query(text, params);
}

// --- Passwords (scrypt; never stored as plain text) ---

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const hash = crypto.scryptSync(String(password), salt, 32).toString('base64url');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored || '').split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const actual = crypto.scryptSync(String(password), salt, expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// --- Schema ---

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS hero_slides (
    id SERIAL PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    video_url TEXT,
    cta_text TEXT,
    cta_link TEXT,
    order_index INTEGER
  );

  CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title TEXT,
    description TEXT,
    icon TEXT,
    category TEXT, -- 'recruitment' or 'travel'
    order_index INTEGER
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title TEXT,
    country TEXT,
    industry TEXT,
    requirements TEXT,
    deadline TEXT,
    status TEXT DEFAULT 'open'
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name TEXT,
    role TEXT,
    content TEXT,
    avatar_url TEXT
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT,
    author TEXT,
    published_at TIMESTAMPTZ DEFAULT now(),
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    profession TEXT,
    country TEXT,
    experience TEXT,
    cv_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Contact form leads. status / crm_* columns let any CRM sync them later.
  CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    subject TEXT,
    message TEXT,
    source TEXT DEFAULT 'website',
    status TEXT DEFAULT 'new',
    crm_id TEXT,
    crm_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Taps on WhatsApp buttons (no personal data: just which button and page).
  CREATE TABLE IF NOT EXISTS whatsapp_clicks (
    id SERIAL PRIMARY KEY,
    source TEXT,
    page TEXT,
    crm_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
  );
`;

const SEED_SLIDES = [
  [
    'Global Talent, Global Reach',
    'Your Best Partner in International Recruitment. Connecting Ghanaian excellence with world-class opportunities in Europe and North America.',
    'https://assets.mixkit.co/videos/preview/mixkit-business-people-walking-in-a-modern-office-4334-large.mp4',
    'Apply Now',
    '/apply',
    1,
  ],
  [
    'Seamless Global Mobility',
    'Expert travel consultancy and visa support for your international journey. We handle the complexity, you focus on your future.',
    'https://assets.mixkit.co/videos/preview/mixkit-airport-terminal-with-people-walking-1574-large.mp4',
    'Explore Services',
    '/services',
    2,
  ],
  [
    'Recruit Top-Tier Talent',
    'Helping global employers source, screen, and prepare qualified candidates from Ghana. Quality talent, ready for the world.',
    'https://assets.mixkit.co/videos/preview/mixkit-group-of-business-people-working-in-the-office-4336-large.mp4',
    'Hire Talent',
    '/recruit',
    3,
  ],
];

// Columns copied from the old Turso database (ids are regenerated).
const TURSO_TABLES = {
  settings: ['key', 'value'],
  hero_slides: ['title', 'subtitle', 'video_url', 'cta_text', 'cta_link', 'order_index'],
  services: ['title', 'description', 'icon', 'category', 'order_index'],
  jobs: ['title', 'country', 'industry', 'requirements', 'deadline', 'status'],
  testimonials: ['name', 'role', 'content', 'avatar_url'],
  blog_posts: ['title', 'content', 'author', 'published_at', 'image_url'],
  applications: ['name', 'email', 'phone', 'profession', 'country', 'experience', 'cv_url', 'status', 'created_at'],
  inquiries: ['name', 'email', 'subject', 'message', 'created_at'],
};

async function count(db, table) {
  const [row] = await db.query(`SELECT count(*)::int AS n FROM ${table}`);
  return row.n;
}

/**
 * One-time copy from Turso, when TURSO_DATABASE_URL is still set and this
 * database hasn't been filled from it yet. Returns a summary.
 */
async function migrateFromTurso(db) {
  if (!process.env.TURSO_DATABASE_URL) return null;
  const done = await db.query("SELECT 1 FROM settings WHERE key = 'migrated_from_turso'");
  if (done.length) return null;

  // Remote Turso uses the pure-JS web client; a file: URL (local testing) needs the native one.
  const { createClient } = process.env.TURSO_DATABASE_URL.startsWith('file:')
    ? await import('@libsql/client')
    : await import('@libsql/client/web');
  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const summary = {};
  for (const [table, cols] of Object.entries(TURSO_TABLES)) {
    let rows;
    try {
      rows = (await turso.execute(`SELECT ${cols.join(', ')} FROM ${table}`)).rows;
    } catch {
      continue; // table missing in Turso
    }
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
    const conflict = table === 'settings' ? ' ON CONFLICT (key) DO UPDATE SET value = excluded.value' : '';
    for (const row of rows) {
      await db.query(
        `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})${conflict}`,
        cols.map((c) => row[c] ?? null),
      );
    }
    summary[table] = rows.length;
  }

  // Users: Turso stored plain-text passwords; hash them on the way in.
  try {
    const users = (await turso.execute('SELECT username, password FROM users')).rows;
    for (const u of users) {
      await db.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
        [u.username, hashPassword(u.password)],
      );
    }
    summary.users = users.length;
  } catch {
    // no users table in Turso
  }

  await db.query(
    "INSERT INTO settings (key, value) VALUES ('migrated_from_turso', $1) ON CONFLICT (key) DO NOTHING",
    [JSON.stringify({ at: new Date().toISOString(), rows: summary })],
  );
  return summary;
}

async function init() {
  const db = await backend();
  await db.tx(async (t) => {
    // Several serverless instances may start at once; only one sets up at a time.
    await t.query('SELECT pg_advisory_xact_lock(724001)');
    await t.exec(SCHEMA);

    const migrated = await migrateFromTurso(t);
    if (migrated) console.log('Copied data from Turso:', migrated);

    if ((await count(t, 'users')) === 0) {
      await t.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [
        process.env.ADMIN_USERNAME || 'admin',
        hashPassword(process.env.ADMIN_PASSWORD || 'admin123'),
      ]);
    }

    if ((await count(t, 'hero_slides')) === 0) {
      for (const args of SEED_SLIDES) {
        await t.query(
          'INSERT INTO hero_slides (title, subtitle, video_url, cta_text, cta_link, order_index) VALUES ($1, $2, $3, $4, $5, $6)',
          args,
        );
      }
    }
  });
}

let ready = null;

/** Creates tables, copies Turso data once, and seeds defaults; call before any query. */
export function ensureDb() {
  if (!ready) ready = init().catch((err) => { ready = null; throw err; });
  return ready;
}
