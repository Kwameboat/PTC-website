import Database from 'better-sqlite3';

const db = new Database('cms.db');

// Initialize tables
db.exec(`
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
`);

// Seed initial data if empty
const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', 'admin123'); // In a real app, hash this
}

const slideCount = db.prepare('SELECT count(*) as count FROM hero_slides').get() as { count: number };
if (slideCount.count === 0) {
  db.prepare('INSERT INTO hero_slides (title, subtitle, video_url, cta_text, cta_link, order_index) VALUES (?, ?, ?, ?, ?, ?)').run(
    'Global Talent, Global Reach',
    'Your Best Partner in International Recruitment. Connecting Ghanaian excellence with world-class opportunities in Europe and North America.',
    'https://assets.mixkit.co/videos/preview/mixkit-business-people-walking-in-a-modern-office-4334-large.mp4',
    'Apply Now',
    '/apply',
    1
  );
  db.prepare('INSERT INTO hero_slides (title, subtitle, video_url, cta_text, cta_link, order_index) VALUES (?, ?, ?, ?, ?, ?)').run(
    'Seamless Global Mobility',
    'Expert travel consultancy and visa support for your international journey. We handle the complexity, you focus on your future.',
    'https://assets.mixkit.co/videos/preview/mixkit-airport-terminal-with-people-walking-1574-large.mp4',
    'Explore Services',
    '/services',
    2
  );
  db.prepare('INSERT INTO hero_slides (title, subtitle, video_url, cta_text, cta_link, order_index) VALUES (?, ?, ?, ?, ?, ?)').run(
    'Recruit Top-Tier Talent',
    'Helping global employers source, screen, and prepare qualified candidates from Ghana. Quality talent, ready for the world.',
    'https://assets.mixkit.co/videos/preview/mixkit-group-of-business-people-working-in-the-office-4336-large.mp4',
    'Hire Talent',
    '/recruit',
    3
  );
}

export default db;
