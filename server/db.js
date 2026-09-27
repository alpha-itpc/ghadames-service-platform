import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'ghadames_services.db');
const db = new sqlite3.Database(dbPath);

// Helper for promise-based queries
export function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

// Initialize tables
export async function initDb() {
  db.serialize(() => {
    // 1. Roles
    db.run(`CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )`);

    // 2. Users
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT UNIQUE NOT NULL,
      whatsapp TEXT,
      password TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    )`);

    // 3. Cities
    db.run(`CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_ar TEXT NOT NULL UNIQUE,
      name_en TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 4. Areas
    db.run(`CREATE TABLE IF NOT EXISTS areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL,
      name_ar TEXT NOT NULL,
      name_en TEXT,
      FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
    )`);

    // 5. Categories
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_ar TEXT NOT NULL,
      name_en TEXT,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    )`);

    // 6. Subcategories
    db.run(`CREATE TABLE IF NOT EXISTS subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name_ar TEXT NOT NULL,
      name_en TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )`);

    // 7. Services
    db.run(`CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      subcategory_id INTEGER,
      name_ar TEXT NOT NULL,
      name_en TEXT,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
    )`);

    // 8. Companies
    db.run(`CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      company_name TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      city_id INTEGER NOT NULL,
      area_id INTEGER NOT NULL,
      phone TEXT NOT NULL,
      whatsapp TEXT,
      email TEXT,
      description TEXT,
      logo_url TEXT,
      cover_url TEXT,
      address TEXT,
      lat REAL,
      lng REAL,
      is_verified INTEGER DEFAULT 0,
      verification_status TEXT DEFAULT 'unverified', -- 'unverified', 'pending', 'verified'
      is_approved INTEGER DEFAULT 0, -- Admin approval
      is_available INTEGER DEFAULT 1,
      rating_avg REAL DEFAULT 5.0,
      rating_count INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (city_id) REFERENCES cities(id),
      FOREIGN KEY (area_id) REFERENCES areas(id)
    )`);

    // 9. Service Providers (Independent Individuals)
    db.run(`CREATE TABLE IF NOT EXISTS service_providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      title TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      city_id INTEGER NOT NULL,
      area_id INTEGER NOT NULL,
      phone TEXT NOT NULL,
      whatsapp TEXT,
      email TEXT,
      description TEXT,
      avatar_url TEXT,
      cover_url TEXT,
      address TEXT,
      lat REAL,
      lng REAL,
      is_verified INTEGER DEFAULT 0,
      verification_status TEXT DEFAULT 'unverified',
      is_approved INTEGER DEFAULT 0,
      is_available INTEGER DEFAULT 1,
      rating_avg REAL DEFAULT 5.0,
      rating_count INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (city_id) REFERENCES cities(id),
      FOREIGN KEY (area_id) REFERENCES areas(id)
    )`);

    // 10. Provider Services (Pivot Table)
    db.run(`CREATE TABLE IF NOT EXISTS provider_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_type TEXT NOT NULL, -- 'company' or 'provider'
      target_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    )`);

    // 11. Provider Images (Portfolio Gallery)
    db.run(`CREATE TABLE IF NOT EXISTS provider_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_type TEXT NOT NULL, -- 'company' or 'provider'
      target_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      caption TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 12. Business Hours
    db.run(`CREATE TABLE IF NOT EXISTS business_hours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_type TEXT NOT NULL, -- 'company' or 'provider'
      target_id INTEGER NOT NULL,
      day_of_week TEXT NOT NULL, -- 'Saturday', 'Sunday', etc.
      open_time TEXT,
      close_time TEXT,
      is_closed INTEGER DEFAULT 0
    )`);

    // 13. Service Requests
    db.run(`CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      provider_type TEXT NOT NULL, -- 'company' or 'provider'
      target_id INTEGER NOT NULL,
      service_id INTEGER,
      description TEXT NOT NULL,
      requested_date TEXT,
      requested_time TEXT,
      address TEXT,
      status TEXT DEFAULT 'new', -- 'new', 'contacted', 'in_progress', 'completed', 'cancelled'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (service_id) REFERENCES services(id)
    )`);

    // 14. Reviews
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      provider_type TEXT NOT NULL, -- 'company' or 'provider'
      target_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      is_approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // 15. Favorites
    db.run(`CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      provider_type TEXT NOT NULL, -- 'company' or 'provider'
      target_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, provider_type, target_id)
    )`);

    // 16. Advertisements
    db.run(`CREATE TABLE IF NOT EXISTS advertisements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT,
      link_url TEXT,
      city_id INTEGER,
      category_id INTEGER,
      placement TEXT DEFAULT 'home_top', -- 'home_top', 'home_middle', 'sidebar'
      start_date TEXT,
      end_date TEXT,
      is_active INTEGER DEFAULT 1,
      clicks INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (city_id) REFERENCES cities(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )`);

    // 17. Notifications
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // 18. Verification Requests
    db.run(`CREATE TABLE IF NOT EXISTS verification_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_type TEXT NOT NULL, -- 'company' or 'provider'
      target_id INTEGER NOT NULL,
      id_document_url TEXT NOT NULL,
      commercial_license_url TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 19. Settings
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`);

    // 20. Audit Logs
    db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
}

export default db;
