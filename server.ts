import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import db from "./src/db.ts";

import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  
  app.get("/health", (req, res) => res.send("OK"));

  // --- API Routes ---
  
  // Save Logo API
  app.post("/api/admin/save-logo", (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).send("No image provided");
    
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    fs.writeFileSync(path.join(process.cwd(), 'public', 'logo.png'), buffer);
    res.json({ success: true });
  });

  // Public Content API
  app.get("/api/content/hero", (req, res) => {
    const slides = db.prepare('SELECT * FROM hero_slides ORDER BY order_index ASC').all();
    res.json(slides);
  });

  app.get("/api/content/services", (req, res) => {
    const services = db.prepare('SELECT * FROM services ORDER BY order_index ASC').all();
    res.json(services);
  });

  app.get("/api/content/jobs", (req, res) => {
    const jobs = db.prepare('SELECT * FROM jobs WHERE status = "open"').all();
    res.json(jobs);
  });

  app.get("/api/content/testimonials", (req, res) => {
    const testimonials = db.prepare('SELECT * FROM testimonials').all();
    res.json(testimonials);
  });

  app.get("/api/content/blog", (req, res) => {
    const posts = db.prepare('SELECT * FROM blog_posts ORDER BY published_at DESC').all();
    res.json(posts);
  });

  // Form Submissions
  app.post("/api/forms/apply", (req, res) => {
    const { name, email, phone, profession, country, experience } = req.body;
    const stmt = db.prepare('INSERT INTO applications (name, email, phone, profession, country, experience) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(name, email, phone, profession, country, experience);
    res.status(201).json({ message: "Application submitted successfully" });
  });

  app.post("/api/forms/inquiry", (req, res) => {
    const { name, email, subject, message } = req.body;
    const stmt = db.prepare('INSERT INTO inquiries (name, email, subject, message) VALUES (?, ?, ?, ?)');
    stmt.run(name, email, subject, message);
    res.status(201).json({ message: "Inquiry submitted successfully" });
  });

  // Admin API (Simplified for this demo - no full JWT for brevity, but could be added)
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
    if (user) {
      res.json({ success: true, token: "mock-token" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // --- Vite Integration ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
