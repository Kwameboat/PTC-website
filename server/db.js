import { createClient } from '@libsql/client';

// On Vercel, TURSO_DATABASE_URL / TURSO_AUTH_TOKEN point at a hosted Turso database.
// Locally (no env vars) it falls back to a SQLite file, cms.db.
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:cms.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS hero_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    subtitle TEXT,
    video_url TEXT,
    cta_text TEXT,
    cta_link TEXT,
    order_index INTEGER
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    icon TEXT,
    category TEXT, -- 'recruitment' or 'travel'
    order_index INTEGER
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    country TEXT,
    industry TEXT,
    requirements TEXT,
    deadline TEXT,
    status TEXT DEFAULT 'open'
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT,
    content TEXT,
    avatar_url TEXT
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    author TEXT,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phone TEXT,
    profession TEXT,
    country TEXT,
    experience TEXT,
    cv_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

async function init() {
  await db.executeMultiple(SCHEMA);

  const users = await db.execute('SELECT count(*) AS count FROM users');
  if (Number(users.rows[0].count) === 0) {
    await db.execute({
      sql: 'INSERT INTO users (username, password) VALUES (?, ?)',
      args: [process.env.ADMIN_USERNAME || 'admin', process.env.ADMIN_PASSWORD || 'admin123'],
    });
  }

  const slides = await db.execute('SELECT count(*) AS count FROM hero_slides');
  if (Number(slides.rows[0].count) === 0) {
    await db.batch(
      SEED_SLIDES.map((args) => ({
        sql: 'INSERT INTO hero_slides (title, subtitle, video_url, cta_text, cta_link, order_index) VALUES (?, ?, ?, ?, ?, ?)',
        args,
      })),
      'write',
    );
  }
}

let ready = null;

/** Creates tables and seed data once per process; call before any query. */
export function ensureDb() {
  if (!ready) ready = init().catch((err) => { ready = null; throw err; });
  return ready;
}
