import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jwt-simple';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { initDb, query, get, run } from './db.js';
import { seed } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ghadames_service_secret_key_2026';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Initialize Database on server start & Auto Seed if empty
async function setupDatabase() {
  await initDb();
  try {
    const usersCount = await get(`SELECT COUNT(*) as count FROM users`);
    if (!usersCount || usersCount.count === 0) {
      console.log('🌱 Database is empty. Seeding initial data...');
      await seed();
    }
  } catch (err) {
    console.log('Db init notice:', err.message);
  }
}
setupDatabase();

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'تتطلب هذه العملية تسجيل الدخول' });

  try {
    const decoded = jwt.decode(token, JWT_SECRET);
    const user = await get(`SELECT users.*, roles.name as role_name FROM users JOIN roles ON users.role_id = roles.id WHERE users.id = ?`, [decoded.id]);
    if (!user) return res.status(403).json({ message: 'حساب غير متاح' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'رمز الدخول غير صالح' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role_name === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'غير مصرح: صلاحية مدير النظام مطلوبة' });
  }
};

// ==================== AUTHENTICATION ROUTES ====================

// Register Customer
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'يرجى إدخال جميع البيانات المطلوبة' });
    }

    const existing = await get(`SELECT id FROM users WHERE phone = ?`, [phone]);
    if (existing) {
      return res.status(400).json({ message: 'رقم الهاتف مسجل بالفعل' });
    }

    const customerRole = await get(`SELECT id FROM roles WHERE name = 'customer'`);
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await run(
      `INSERT INTO users (name, phone, email, password, role_id) VALUES (?, ?, ?, ?, ?)`,
      [name, phone, email || null, passwordHash, customerRole.id]
    );

    const newUser = await get(`SELECT users.*, roles.name as role_name FROM users JOIN roles ON users.role_id = roles.id WHERE users.id = ?`, [result.id]);
    const token = jwt.encode({ id: newUser.id, role: newUser.role_name }, JWT_SECRET);

    res.json({ token, user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء الإنشاء', error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'يرجى إدخال رقم الهاتف وكلمة المرور' });
    }

    const user = await get(`SELECT users.*, roles.name as role_name FROM users JOIN roles ON users.role_id = roles.id WHERE users.phone = ?`, [phone]);
    if (!user) {
      return res.status(400).json({ message: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
    }

    // Get Provider or Company ID if applicable
    let targetInfo = null;
    if (user.role_name === 'provider') {
      targetInfo = await get(`SELECT id, is_approved, verification_status FROM service_providers WHERE user_id = ?`, [user.id]);
    } else if (user.role_name === 'company') {
      targetInfo = await get(`SELECT id, is_approved, verification_status FROM companies WHERE user_id = ?`, [user.id]);
    }

    const token = jwt.encode({ id: user.id, role: user.role_name }, JWT_SECRET);
    res.json({ token, user: { ...user, target_info: targetInfo } });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول', error: err.message });
  }
});

// Get Current User Profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    let targetInfo = null;
    if (req.user.role_name === 'provider') {
      targetInfo = await get(`SELECT * FROM service_providers WHERE user_id = ?`, [req.user.id]);
    } else if (req.user.role_name === 'company') {
      targetInfo = await get(`SELECT * FROM companies WHERE user_id = ?`, [req.user.id]);
    }

    res.json({ user: { ...req.user, target_info: targetInfo } });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب بيانات المستخدم' });
  }
});

// ==================== CITIES & AREAS ====================

app.get('/api/cities', async (req, res) => {
  try {
    const cities = await query(`SELECT * FROM cities WHERE is_active = 1 ORDER BY id ASC`);
    for (const city of cities) {
      city.areas = await query(`SELECT * FROM areas WHERE city_id = ? ORDER BY name_ar ASC`, [city.id]);
    }
    res.json(cities);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب المدن والمناطق' });
  }
});

app.get('/api/cities/:id/areas', async (req, res) => {
  try {
    const areas = await query(`SELECT * FROM areas WHERE city_id = ? ORDER BY name_ar ASC`, [req.params.id]);
    res.json(areas);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب المناطق' });
  }
});

// Admin Add City
app.post('/api/admin/cities', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name_ar, name_en } = req.body;
    const result = await run(`INSERT INTO cities (name_ar, name_en) VALUES (?, ?)`, [name_ar, name_en]);
    res.json({ id: result.id, name_ar, name_en });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء إضافة المدينة' });
  }
});

// Admin Add Area
app.post('/api/admin/areas', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { city_id, name_ar } = req.body;
    const result = await run(`INSERT INTO areas (city_id, name_ar) VALUES (?, ?)`, [city_id, name_ar]);
    res.json({ id: result.id, city_id, name_ar });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء إضافة المنطقة' });
  }
});

// ==================== CATEGORIES & SERVICES ====================

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await query(`SELECT * FROM categories ORDER BY sort_order ASC, id ASC`);
    for (const cat of categories) {
      cat.services = await query(`SELECT * FROM services WHERE category_id = ?`, [cat.id]);
      const provCount = await get(
        `SELECT (SELECT COUNT(*) FROM service_providers WHERE category_id = ? AND is_approved = 1) + 
                (SELECT COUNT(*) FROM companies WHERE category_id = ? AND is_approved = 1) as total`,
        [cat.id, cat.id]
      );
      cat.providers_count = provCount ? provCount.total : 0;
    }
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب التصنيفات' });
  }
});

// Admin Add Category
app.post('/api/admin/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name_ar, icon, description } = req.body;
    const slug = name_ar.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now();
    const result = await run(
      `INSERT INTO categories (name_ar, slug, icon, description) VALUES (?, ?, ?, ?)`,
      [name_ar, slug, icon || 'Wrench', description]
    );
    res.json({ id: result.id, name_ar, slug });
  } catch (err) {
    res.status(500).json({ message: 'خطأ أثناء إضافة التصنيف' });
  }
});

// Admin Add Service
app.post('/api/admin/services', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { category_id, name_ar } = req.body;
    const slug = name_ar.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now();
    const result = await run(
      `INSERT INTO services (category_id, name_ar, slug) VALUES (?, ?, ?)`,
      [category_id, name_ar, slug]
    );
    res.json({ id: result.id, category_id, name_ar });
  } catch (err) {
    res.status(500).json({ message: 'خطأ أثناء إضافة الخدمة' });
  }
});

// ==================== SEARCH & PROVIDERS ====================

// Search API
app.get('/api/search', async (req, res) => {
  try {
    const { q, city_id, area_id, category_id, type, verified, available } = req.query;

    let provSql = `
      SELECT sp.*, 'provider' as type, c.name_ar as category_name, ct.name_ar as city_name, ar.name_ar as area_name
      FROM service_providers sp
      JOIN categories c ON sp.category_id = c.id
      JOIN cities ct ON sp.city_id = ct.id
      JOIN areas ar ON sp.area_id = ar.id
      WHERE sp.is_approved = 1
    `;
    let compSql = `
      SELECT comp.*, 'company' as type, c.name_ar as category_name, ct.name_ar as city_name, ar.name_ar as area_name
      FROM companies comp
      JOIN categories c ON comp.category_id = c.id
      JOIN cities ct ON comp.city_id = ct.id
      JOIN areas ar ON comp.area_id = ar.id
      WHERE comp.is_approved = 1
    `;

    const provParams = [];
    const compParams = [];

    if (q) {
      const searchTerm = `%${q}%`;
      provSql += ` AND (sp.full_name LIKE ? OR sp.title LIKE ? OR sp.description LIKE ? OR c.name_ar LIKE ?)`;
      provParams.push(searchTerm, searchTerm, searchTerm, searchTerm);

      compSql += ` AND (comp.company_name LIKE ? OR comp.description LIKE ? OR c.name_ar LIKE ?)`;
      compParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (city_id) {
      provSql += ` AND sp.city_id = ?`;
      provParams.push(city_id);
      compSql += ` AND comp.city_id = ?`;
      compParams.push(city_id);
    }

    if (area_id) {
      provSql += ` AND sp.area_id = ?`;
      provParams.push(area_id);
      compSql += ` AND comp.area_id = ?`;
      compParams.push(area_id);
    }

    if (category_id) {
      provSql += ` AND sp.category_id = ?`;
      provParams.push(category_id);
      compSql += ` AND comp.category_id = ?`;
      compParams.push(category_id);
    }

    if (verified === '1') {
      provSql += ` AND sp.is_verified = 1`;
      compSql += ` AND comp.is_verified = 1`;
    }

    if (available === '1') {
      provSql += ` AND sp.is_available = 1`;
      compSql += ` AND comp.is_available = 1`;
    }

    let results = [];
    if (!type || type === 'all' || type === 'provider') {
      const providers = await query(provSql, provParams);
      results = results.concat(providers.map(p => ({ ...p, name: p.full_name, image: p.avatar_url })));
    }

    if (!type || type === 'all' || type === 'company') {
      const companies = await query(compSql, compParams);
      results = results.concat(companies.map(c => ({ ...c, name: c.company_name, image: c.logo_url })));
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في عملية البحث', error: err.message });
  }
});

// Featured Providers & Companies
app.get('/api/providers/featured', async (req, res) => {
  try {
    const providers = await query(`
      SELECT sp.*, 'provider' as type, c.name_ar as category_name, ct.name_ar as city_name, ar.name_ar as area_name
      FROM service_providers sp
      JOIN categories c ON sp.category_id = c.id
      JOIN cities ct ON sp.city_id = ct.id
      JOIN areas ar ON sp.area_id = ar.id
      WHERE sp.is_approved = 1 AND sp.is_verified = 1
      ORDER BY sp.rating_avg DESC LIMIT 6
    `);
    res.json(providers.map(p => ({ ...p, name: p.full_name, image: p.avatar_url })));
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب المميزين' });
  }
});

app.get('/api/companies/featured', async (req, res) => {
  try {
    const companies = await query(`
      SELECT comp.*, 'company' as type, c.name_ar as category_name, ct.name_ar as city_name, ar.name_ar as area_name
      FROM companies comp
      JOIN categories c ON comp.category_id = c.id
      JOIN cities ct ON comp.city_id = ct.id
      JOIN areas ar ON comp.area_id = ar.id
      WHERE comp.is_approved = 1
      ORDER BY comp.rating_avg DESC LIMIT 6
    `);
    res.json(companies.map(c => ({ ...c, name: c.company_name, image: c.logo_url })));
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الشركات المميزة' });
  }
});

// Get Single Provider or Company Details
app.get('/api/provider/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    let data = null;

    if (type === 'provider') {
      data = await get(`
        SELECT sp.*, 'provider' as type, c.name_ar as category_name, ct.name_ar as city_name, ar.name_ar as area_name
        FROM service_providers sp
        JOIN categories c ON sp.category_id = c.id
        JOIN cities ct ON sp.city_id = ct.id
        JOIN areas ar ON sp.area_id = ar.id
        WHERE sp.id = ?
      `, [id]);
      if (data) {
        data.name = data.full_name;
        data.image = data.avatar_url;
      }
    } else if (type === 'company') {
      data = await get(`
        SELECT comp.*, 'company' as type, c.name_ar as category_name, ct.name_ar as city_name, ar.name_ar as area_name
        FROM companies comp
        JOIN categories c ON comp.category_id = c.id
        JOIN cities ct ON comp.city_id = ct.id
        JOIN areas ar ON comp.area_id = ar.id
        WHERE comp.id = ?
      `, [id]);
      if (data) {
        data.name = data.company_name;
        data.image = data.logo_url;
      }
    }

    if (!data) {
      return res.status(404).json({ message: 'الصفحة غير موجودة' });
    }

    // Increment view count
    if (type === 'provider') {
      await run(`UPDATE service_providers SET views_count = views_count + 1 WHERE id = ?`, [id]);
    } else {
      await run(`UPDATE companies SET views_count = views_count + 1 WHERE id = ?`, [id]);
    }

    // Images
    data.images = await query(`SELECT * FROM provider_images WHERE provider_type = ? AND target_id = ?`, [type, id]);

    // Business Hours
    data.business_hours = await query(`SELECT * FROM business_hours WHERE provider_type = ? AND target_id = ?`, [type, id]);

    // Provided Services
    data.services = await query(`
      SELECT s.* FROM services s
      JOIN provider_services ps ON s.id = ps.service_id
      WHERE ps.provider_type = ? AND ps.target_id = ?
    `, [type, id]);

    // Reviews
    data.reviews = await query(`
      SELECT r.*, u.name as customer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.provider_type = ? AND r.target_id = ? AND r.is_approved = 1
      ORDER BY r.created_at DESC
    `, [type, id]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب بيانات مقدم الخدمة', error: err.message });
  }
});

// Register New Business ("أضف نشاطك التجاري")
app.post('/api/register-business', async (req, res) => {
  try {
    const {
      name, account_type, title, company_name, phone, whatsapp, email, password,
      city_id, area_id, category_id, description, address, avatar_url, logo_url
    } = req.body;

    if (!phone || !password || !account_type || !category_id || !city_id || !area_id) {
      return res.status(400).json({ message: 'يرجى إكمال جميع الحقول الإلزامية' });
    }

    const existingUser = await get(`SELECT id FROM users WHERE phone = ?`, [phone]);
    if (existingUser) {
      return res.status(400).json({ message: 'رقم الهاتف مسجل بالفعل مسبقاً' });
    }

    const roleName = account_type === 'company' ? 'company' : 'provider';
    const roleObj = await get(`SELECT id FROM roles WHERE name = ?`, [roleName]);
    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await run(
      `INSERT INTO users (name, phone, whatsapp, email, password, role_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [account_type === 'company' ? company_name : name, phone, whatsapp || phone, email || null, passwordHash, roleObj.id]
    );

    const userId = userResult.id;

    if (account_type === 'company') {
      await run(
        `INSERT INTO companies (
          user_id, company_name, category_id, city_id, area_id, phone, whatsapp, email, description, logo_url, address, is_approved, is_verified, verification_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'pending')`,
        [userId, company_name, category_id, city_id, area_id, phone, whatsapp || phone, email, description, logo_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=400&q=80', address]
      );
    } else {
      await run(
        `INSERT INTO service_providers (
          user_id, full_name, title, category_id, city_id, area_id, phone, whatsapp, email, description, avatar_url, address, is_approved, is_verified, verification_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'pending')`,
        [userId, name, title || 'مقدم خدمة', category_id, city_id, area_id, phone, whatsapp || phone, email, description, avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', address]
      );
    }

    res.json({
      success: true,
      message: 'تم إرسال طلبك بنجاح! حسابك حالياً قيد المراجعة والتدقيق من قبل الإدارة وسوف يظهر للعامة فور الموافقة عليه.'
    });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء تسجيل النشاط التجاري', error: err.message });
  }
});

// ==================== SERVICE REQUESTS ====================

// Submit Request
app.post('/api/requests', async (req, res) => {
  try {
    const {
      customer_id, customer_name, customer_phone, provider_type, target_id, service_id, description, requested_date, requested_time, address
    } = req.body;

    if (!customer_name || !customer_phone || !provider_type || !target_id || !description) {
      return res.status(400).json({ message: 'يرجى إكمال بيانات الطلب' });
    }

    const result = await run(
      `INSERT INTO service_requests (customer_id, customer_name, customer_phone, provider_type, target_id, service_id, description, requested_date, requested_time, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [customer_id || null, customer_name, customer_phone, provider_type, target_id, service_id || null, description, requested_date || null, requested_time || null, address || null]
    );

    res.json({ success: true, message: 'تم إرسال طلب الخدمة بنجاح، وسيتم التواصل معك قريباً', request_id: result.id });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في إرسال طلب الخدمة' });
  }
});

// Get Incoming Requests for Provider / Company Dashboard
app.get('/api/provider/requests', authenticateToken, async (req, res) => {
  try {
    let target = null;
    if (req.user.role_name === 'provider') {
      target = await get(`SELECT id FROM service_providers WHERE user_id = ?`, [req.user.id]);
    } else if (req.user.role_name === 'company') {
      target = await get(`SELECT id FROM companies WHERE user_id = ?`, [req.user.id]);
    }

    if (!target) return res.status(400).json({ message: 'حساب غير مرتبط بمركز خدمة' });

    const requests = await query(
      `SELECT sr.*, s.name_ar as service_name
       FROM service_requests sr
       LEFT JOIN services s ON sr.service_id = s.id
       WHERE sr.provider_type = ? AND sr.target_id = ?
       ORDER BY sr.created_at DESC`,
      [req.user.role_name, target.id]
    );

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الطلبات' });
  }
});

// Update Request Status
app.put('/api/provider/requests/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body; // 'new', 'contacted', 'in_progress', 'completed', 'cancelled'
    await run(`UPDATE service_requests SET status = ? WHERE id = ?`, [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في تحديث حالة الطلب' });
  }
});

// Get Customer Requests
app.get('/api/customer/requests', authenticateToken, async (req, res) => {
  try {
    const requests = await query(
      `SELECT sr.*, s.name_ar as service_name
       FROM service_requests sr
       LEFT JOIN services s ON sr.service_id = s.id
       WHERE sr.customer_id = ?
       ORDER BY sr.created_at DESC`,
      [req.user.id]
    );
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الطلبات' });
  }
});

// ==================== REVIEWS ====================

app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { provider_type, target_id, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'يرجى إعطاء تقييم من 1 إلى 5' });
    }

    await run(
      `INSERT INTO reviews (customer_id, provider_type, target_id, rating, comment) VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, provider_type, target_id, rating, comment || null]
    );

    // Recalculate average rating
    const stats = await get(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE provider_type = ? AND target_id = ? AND is_approved = 1`,
      [provider_type, target_id]
    );

    if (provider_type === 'provider') {
      await run(`UPDATE service_providers SET rating_avg = ?, rating_count = ? WHERE id = ?`, [stats.avg_rating || 5, stats.count, target_id]);
    } else {
      await run(`UPDATE companies SET rating_avg = ?, rating_count = ? WHERE id = ?`, [stats.avg_rating || 5, stats.count, target_id]);
    }

    res.json({ success: true, message: 'شكراً لك! تم نشر تقييمك بنجاح.' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في إضافة التقييم' });
  }
});

// ==================== ADS ====================

app.get('/api/ads', async (req, res) => {
  try {
    const ads = await query(`SELECT * FROM advertisements WHERE is_active = 1 ORDER BY id DESC`);
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الإعلانات' });
  }
});

// ==================== UPLOAD ROUTE ====================

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'لم يتم اختيار أي ملف' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// ==================== ADMIN DASHBOARD ====================

app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const usersCount = await get(`SELECT COUNT(*) as c FROM users`);
    const companiesCount = await get(`SELECT COUNT(*) as c FROM companies`);
    const providersCount = await get(`SELECT COUNT(*) as c FROM service_providers`);
    const requestsCount = await get(`SELECT COUNT(*) as c FROM service_requests`);
    const pendingCount = await get(
      `SELECT (SELECT COUNT(*) FROM service_providers WHERE is_approved = 0) + (SELECT COUNT(*) FROM companies WHERE is_approved = 0) as total`
    );
    const verifiedCount = await get(
      `SELECT (SELECT COUNT(*) FROM service_providers WHERE is_verified = 1) + (SELECT COUNT(*) FROM companies WHERE is_verified = 1) as total`
    );

    res.json({
      total_users: usersCount.c,
      total_companies: companiesCount.c,
      total_providers: providersCount.c,
      total_requests: requestsCount.c,
      pending_approvals: pendingCount.total,
      verified_accounts: verifiedCount.total
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في إحصائيات الأدمن' });
  }
});

// Pending Accounts for Approval
app.get('/api/admin/pending-approvals', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const providers = await query(`
      SELECT sp.*, 'provider' as account_type, c.name_ar as category_name
      FROM service_providers sp
      JOIN categories c ON sp.category_id = c.id
      WHERE sp.is_approved = 0
    `);
    const companies = await query(`
      SELECT comp.*, 'company' as account_type, c.name_ar as category_name
      FROM companies comp
      JOIN categories c ON comp.category_id = c.id
      WHERE comp.is_approved = 0
    `);

    res.json([...providers.map(p => ({ ...p, name: p.full_name })), ...companies.map(c => ({ ...c, name: c.company_name }))]);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب قائمة المراجعة' });
  }
});

// Approve or Reject Account
app.post('/api/admin/approve-account', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, id, approve } = req.body;
    const isApproved = approve ? 1 : -1;

    if (type === 'provider') {
      await run(`UPDATE service_providers SET is_approved = ?, is_verified = ?, verification_status = ? WHERE id = ?`, [
        isApproved, approve ? 1 : 0, approve ? 'verified' : 'unverified', id
      ]);
    } else {
      await run(`UPDATE companies SET is_approved = ?, is_verified = ?, verification_status = ? WHERE id = ?`, [
        isApproved, approve ? 1 : 0, approve ? 'verified' : 'unverified', id
      ]);
    }

    res.json({ success: true, message: approve ? 'تم اعتماد الحساب وتوثيقه بنجاح' : 'تم رفض الحساب' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في اعتماد الحساب' });
  }
});

// Catch-all for API 404
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'مسار API غير معروف' });
});

// Serve frontend build in production if available
const frontendBuildPath = path.join(__dirname, '../dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});
