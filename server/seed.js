import bcrypt from 'bcryptjs';
import { initDb, run, get, query } from './db.js';

export async function seed() {
  console.log('🚀 Starting Database Seeding...');

  await initDb();

  // 1. Roles
  const roles = ['admin', 'company', 'provider', 'customer'];
  for (const r of roles) {
    await run(`INSERT OR IGNORE INTO roles (name) VALUES (?)`, [r]);
  }

  // Get Role IDs
  const adminRole = await get(`SELECT id FROM roles WHERE name = 'admin'`);
  const companyRole = await get(`SELECT id FROM roles WHERE name = 'company'`);
  const providerRole = await get(`SELECT id FROM roles WHERE name = 'provider'`);
  const customerRole = await get(`SELECT id FROM roles WHERE name = 'customer'`);

  // 2. Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  await run(
    `INSERT OR IGNORE INTO users (name, email, phone, password, role_id) VALUES (?, ?, ?, ?, ?)`,
    ['إدارة خدمات غدامس', 'admin@ghadames-service.ly', '0910000000', passwordHash, adminRole.id]
  );

  // 3. Cities
  const citiesData = [
    { name_ar: 'غدامس', name_en: 'Ghadames' },
    { name_ar: 'درج', name_en: 'Derj' },
    { name_ar: 'سيناون', name_en: 'Sinawan' },
    { name_ar: 'وازن', name_en: 'Wazin' },
    { name_ar: 'نالوت', name_en: 'Nalut' },
    { name_ar: 'زوارة', name_en: 'Zuwara' },
    { name_ar: 'طرابلس', name_en: 'Tripoli' },
    { name_ar: 'بنغازي', name_en: 'Benghazi' }
  ];

  for (const c of citiesData) {
    await run(`INSERT OR IGNORE INTO cities (name_ar, name_en) VALUES (?, ?)`, [c.name_ar, c.name_en]);
  }

  const ghadames = await get(`SELECT id FROM cities WHERE name_ar = 'غدامس'`);
  const derj = await get(`SELECT id FROM cities WHERE name_ar = 'درج'`);

  // 4. Areas for Ghadames
  const ghadamesAreas = [
    'وسط المدينة',
    'المدينة القديمة',
    'منطقة التونسية',
    'منطقة تيني',
    'منطقة يشع',
    'منطقة كومن',
    'منطقة المطار',
    'حي السلام',
    'حي الأمل'
  ];

  for (const area of ghadamesAreas) {
    await run(`INSERT OR IGNORE INTO areas (city_id, name_ar) VALUES (?, ?)`, [ghadames.id, area]);
  }

  // Areas for Derj
  const derjAreas = ['وسط المدينة - درج', 'حي المجاهدين', 'حي النصر'];
  for (const area of derjAreas) {
    await run(`INSERT OR IGNORE INTO areas (city_id, name_ar) VALUES (?, ?)`, [derj.id, area]);
  }

  // 5. Categories & Services
  const categoriesData = [
    {
      name_ar: 'سباكة',
      slug: 'plumbing',
      icon: 'Wrench',
      description: 'صيانة وتسريب المياه، أدوات صحية، شبكات مياه وصرف',
      services: ['صيانة تسريبات المياه', 'تركيب وتجديد أدوات صحية', 'تمديد شبكات المياه والصرف الصحي', 'تركيب مضخات وخزانات المياه']
    },
    {
      name_ar: 'كهرباء',
      slug: 'electricity',
      icon: 'Zap',
      description: 'صيانة وتأسيس شبكات الكهرباء، المولدات، والإنارة',
      services: ['تأسيس كهرباء مبانٍ وشقق', 'صيانة أعطال وحمل زائد', 'تركيب وتوصيل خطوط المولدات', 'تركيب ثريات وشاشات وإنارة']
    },
    {
      name_ar: 'مقاولات وبناء',
      slug: 'construction',
      icon: 'Building2',
      description: 'أعمال البناء، الترميمات العامة، الهياكل والتشطيب',
      services: ['بناء هيكل خرساني وبناء طوب', 'ترميم وصيانة منازل قديمة', 'إشراف ومقاولات عامة', 'صيانة أسقف وعزل رطوبة']
    },
    {
      name_ar: 'دهانات ومحارة',
      slug: 'painting',
      icon: 'Paintbrush',
      description: 'دهانات داخلية وخارجية، معجون وديكورات وجبس بورد',
      services: ['دهان داخلي وخارجي للفلل والشقق', 'تركيب جبس بورد وأسقف معلقة', 'معجون ولياسة ومحارة', 'دهانات حديثة وديكورات']
    },
    {
      name_ar: 'سيراميك ورخام',
      slug: 'tiling',
      icon: 'Grid',
      description: 'تركيب السيراميك، البورسلين، الرخام وجلي الأرضيات',
      services: ['تركيب سيراميك أرضيات وجدران', 'تركيب رخام وجرانيت', 'جلي وتلميع الرخام والبلاط', 'تركيب بلاط انترلوك وحجر']
    },
    {
      name_ar: 'نجارة وأثاث',
      slug: 'carpentry',
      icon: 'Hammer',
      description: 'صيانة أثاث، تصنيع أبواب، تركيب مطابخ وفك وتركيب',
      services: ['تصنيع وتركيب أبواب ونوافذ خشب', 'تركيب مطابخ خشبية وألمنيوم', 'فك وتركيب وغرف نوم وأثاث', 'صيانة غرف وأثاث خشبي']
    },
    {
      name_ar: 'ألمنيوم وزجاج',
      slug: 'aluminum',
      icon: 'LayoutApp',
      description: 'مطابخ ألمنيوم، نوافذ سحاب وشيش، واجهات زجاجية',
      services: ['تركيب نوافذ وأبواب ألمنيوم', 'تصنيع مطابخ ألمنيوم حديثة', 'تركيب واجهات زجاجية وسكريت', 'صيانة شيش ومطابخ']
    },
    {
      name_ar: 'حدادة وشبابيك',
      slug: 'blacksmith',
      icon: 'ShieldAlert',
      description: 'بوابات حديدية، مظلات، شبكات حماية وهياكل معدنية',
      services: ['تصنيع أبواب وبوابات حديد', 'تركيب حماية شبابيك ومظلات', 'صيانة أبواب كهربائية وأوتوماتيكية', 'لحام وهياكل معدنية']
    },
    {
      name_ar: 'تكييف وتبريد',
      slug: 'hvac',
      icon: 'Snowflake',
      description: 'صيانة وتعبئة فريون التكييف، الثلاجات والأجهزة',
      services: ['صيانة وفك وتركيب تكييف سبليت', 'تنظيف وشحن فريون للتكييف', 'صيانة ثلاجات وغسالات منزلية', 'صيانة تكييف صحراوي ومركزي']
    },
    {
      name_ar: 'تنظيف ومكافحة حشرات',
      slug: 'cleaning',
      icon: 'Sparkles',
      description: 'تنظيف منازل، خضانات مياه، سجاد ومكافحة آفات',
      services: ['تنظيف منازل وفلل بعد البناء', 'تنظيف وتطهير خزانات المياه', 'غسيل سجاد ومفروشات', 'رش وتطهير ومكافحة حشرات']
    },
    {
      name_ar: 'نقل وتوصيل',
      slug: 'transportation',
      icon: 'Truck',
      description: 'نقل أثاث، توصيل بضائع، سطحة وسحب سيارات',
      services: ['نقل أثاث ومنازل مع الفك والتركيب', 'خدمات الشحن ونقل البضائع', 'سطحة ونقل سيارات معطلة', 'توصيل طلبات ومعدات']
    },
    {
      name_ar: 'خدمات سيارات',
      slug: 'automotive',
      icon: 'Car',
      description: 'ميكانيك، كهرباء سيارات، غيار زيت وفحص كمبيوتر',
      services: ['ميكانيك سيارات خفيف وثقيل', 'كهرباء سيارات وتكييف سيارات', 'فحص كمبيوتر وكشف أعطال', 'تغيير زيت وتصليح إطارات']
    },
    {
      name_ar: 'خدمات منزلية ومزارع',
      slug: 'home-garden',
      icon: 'Home',
      description: 'تنسيق حدائق، صيانة آبار ومضخات زراعية',
      services: ['تنسيق حدائق وقص أشجار', 'صيانة آبار ومضخات زراعية', 'تركيب شبكات ري حديثة', 'حفر وصيانة صهاريج مياه']
    },
    {
      name_ar: 'خدمات تقنية وتصميم',
      slug: 'tech-design',
      icon: 'Monitor',
      description: 'كاميرات مراقبة، صيانة كمبيوتر، شبكات وتصميم',
      services: ['تركيب كاميرات مراقبة وشبكات', 'صيانة أجهزة كمبيوتر ولابتوب', 'تصميم جرافيك وهويات تجارية', 'تركيب أجهزة إنترنت ورسيفرات']
    }
  ];

  for (let i = 0; i < categoriesData.length; i++) {
    const cat = categoriesData[i];
    const catResult = await run(
      `INSERT OR IGNORE INTO categories (name_ar, name_en, slug, icon, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
      [cat.name_ar, cat.name_ar, cat.slug, cat.icon, cat.description, i + 1]
    );

    const insertedCat = await get(`SELECT id FROM categories WHERE slug = ?`, [cat.slug]);

    for (const serviceName of cat.services) {
      const sSlug = cat.slug + '-' + Math.random().toString(36).substring(7);
      await run(
        `INSERT OR IGNORE INTO services (category_id, name_ar, slug, icon) VALUES (?, ?, ?, ?)`,
        [insertedCat.id, serviceName, sSlug, cat.icon]
      );
    }
  }

  // Fetch some IDs for Sample Providers & Companies
  const mainAreas = await query(`SELECT id, name_ar FROM areas WHERE city_id = ?`, [ghadames.id]);
  const plumbingCat = await get(`SELECT id FROM categories WHERE slug = 'plumbing'`);
  const elecCat = await get(`SELECT id FROM categories WHERE slug = 'electricity'`);
  const constrCat = await get(`SELECT id FROM categories WHERE slug = 'construction'`);
  const hvacCat = await get(`SELECT id FROM categories WHERE slug = 'hvac'`);
  const autoCat = await get(`SELECT id FROM categories WHERE slug = 'automotive'`);

  // 6. Sample Provider Users & Profiles
  const sampleProviders = [
    {
      name: 'عبدالسلام الغدامسي',
      title: 'فني سباكة وتسريبات مياه خبير',
      phone: '0912345678',
      whatsapp: '218912345678',
      email: 'abdulsalam@ghadames.ly',
      cat: plumbingCat.id,
      area: mainAreas[0].id, // وسط المدينة
      address: 'شارع السوق القديم - غدامس',
      desc: 'خبرة أكثر من 12 سنة في تمديد وصيانة جميع أنواع السباكة، كشف تسريبات المياه، تركيب مضخات وخزانات وأدوات صحية عالية الجودة.',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
      cover: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
      verified: 1,
      vStatus: 'verified',
      rating: 4.9,
      ratingCount: 18,
      lat: 30.1333,
      lng: 9.5
    },
    {
      name: 'المهندس يونس التيني',
      title: 'أخصائي تكييف وتبريد وتأسيس شبكات',
      phone: '0925554433',
      whatsapp: '218925554433',
      email: 'younes@ghadames.ly',
      cat: hvacCat.id,
      area: mainAreas[2].id, // منطقة التونسية
      address: 'طريق التونسية الرئيسي - غدامس',
      desc: 'صيانة وفك وتركيب جميع أنواع التكييف (سبليت، صحراوي، مركزي)، تنظيف وشحن فريون إيطالي أصلي، صيانة ثلاجات وغسالات.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      cover: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
      verified: 1,
      vStatus: 'verified',
      rating: 4.8,
      ratingCount: 24,
      lat: 30.138,
      lng: 9.51
    },
    {
      name: 'معلم جمعة الكهربائي',
      title: 'كهربائي منازل ومولدات وصيانة خطوط',
      phone: '0917778899',
      whatsapp: '218917778899',
      email: 'jumaa@ghadames.ly',
      cat: elecCat.id,
      area: mainAreas[3].id, // منطقة تيني
      address: 'حي تيني - غدامس',
      desc: 'تأسيس وصيانة كهرباء المباني والمنازل، تمديد خطوط المولدات الأوتوماتيكية، تركيب لوحات التوزيع وقطع الحماية والإنارة.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      verified: 1,
      vStatus: 'verified',
      rating: 5.0,
      ratingCount: 31,
      lat: 30.131,
      lng: 9.495
    },
    {
      name: 'أسامة فني ميكانيك السيارات',
      title: 'صيانة ميكانيك وسحب سيارات وطوارئ',
      phone: '0941112233',
      whatsapp: '218941112233',
      email: 'osama@ghadames.ly',
      cat: autoCat.id,
      area: mainAreas[6].id, // منطقة المطار
      address: 'طريق المطار - غدامس',
      desc: 'ورشة متخصصة في صيانة ميكانيك السيارات، فحص كمبيوتر، خدمة الطوارئ على الطريق وسطحة سحب سيارات داخل وخارج غدامس.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      cover: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&q=80',
      verified: 0,
      vStatus: 'pending',
      rating: 4.7,
      ratingCount: 12,
      lat: 30.145,
      lng: 9.52
    }
  ];

  for (const p of sampleProviders) {
    const pHash = await bcrypt.hash('pass123', 10);
    const userRes = await run(
      `INSERT OR IGNORE INTO users (name, email, phone, whatsapp, password, role_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [p.name, p.email, p.phone, p.whatsapp, pHash, providerRole.id]
    );

    const u = await get(`SELECT id FROM users WHERE phone = ?`, [p.phone]);

    const provRes = await run(
      `INSERT OR IGNORE INTO service_providers (
        user_id, full_name, title, category_id, city_id, area_id, phone, whatsapp, email, description, avatar_url, cover_url, address, lat, lng, is_verified, verification_status, is_approved, is_available, rating_avg, rating_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)`,
      [
        u.id, p.name, p.title, p.cat, ghadames.id, p.area, p.phone, p.whatsapp, p.email, p.desc, p.avatar, p.cover, p.address, p.lat, p.lng, p.verified, p.vStatus, p.rating, p.ratingCount
      ]
    );

    const insertedProv = await get(`SELECT id FROM service_providers WHERE user_id = ?`, [u.id]);

    // Add portfolio images
    await run(`INSERT INTO provider_images (provider_type, target_id, image_url, caption) VALUES (?, ?, ?, ?)`, [
      'provider', insertedProv.id, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80', 'نموذج عمل صيانة وتأسيس'
    ]);
    await run(`INSERT INTO provider_images (provider_type, target_id, image_url, caption) VALUES (?, ?, ?, ?)`, [
      'provider', insertedProv.id, 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80', 'تركيب وتشغيل الأجهزة'
    ]);

    // Add business hours
    const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
    for (const d of days) {
      await run(`INSERT INTO business_hours (provider_type, target_id, day_of_week, open_time, close_time, is_closed) VALUES (?, ?, ?, ?, ?, 0)`, [
        'provider', insertedProv.id, d, '08:00', '20:00'
      ]);
    }
    await run(`INSERT INTO business_hours (provider_type, target_id, day_of_week, open_time, close_time, is_closed) VALUES (?, ?, ?, ?, ?, 1)`, [
      'provider', insertedProv.id, 'الجمعة', '', ''
    ]);
  }

  // 7. Sample Companies
  const sampleCompanies = [
    {
      company_name: 'شركة واحة غدامس للمقاولات العامة والتجهيزات',
      phone: '0919998877',
      whatsapp: '218919998877',
      email: 'info@g-contracting.ly',
      cat: constrCat.id,
      area: mainAreas[0].id,
      address: 'الشارع الرئيسي - غدامس',
      desc: 'شركة متخصصة في تنفيذ المشاريع السكنية والتجارية، أعمال البناء الخرساني، الترميمات الشاملة، والتشطيبات الفاخرة بأعلى المعايير.',
      logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=400&q=80',
      cover: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
      verified: 1,
      vStatus: 'verified',
      rating: 4.95,
      ratingCount: 42,
      lat: 30.134,
      lng: 9.505
    },
    {
      company_name: 'مؤسسة الصحراء للخدمات والتكييف والتبريد',
      phone: '0928887766',
      whatsapp: '218928887766',
      email: 'contact@sahara-hvac.ly',
      cat: hvacCat.id,
      area: mainAreas[4].id, // منطقة كومن
      address: 'حي كومن - غدامس',
      desc: 'توريد وتركيب وصيانة أنظمة التكييف المركزي والتبريد الصناعي والتكييف الصحراوي للمنازل والمؤسسات والمحلات التجارية.',
      logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80',
      cover: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80',
      verified: 1,
      vStatus: 'verified',
      rating: 4.85,
      ratingCount: 19,
      lat: 30.136,
      lng: 9.502
    }
  ];

  for (const c of sampleCompanies) {
    const cHash = await bcrypt.hash('pass123', 10);
    await run(
      `INSERT OR IGNORE INTO users (name, email, phone, whatsapp, password, role_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [c.company_name, c.email, c.phone, c.whatsapp, cHash, companyRole.id]
    );

    const u = await get(`SELECT id FROM users WHERE phone = ?`, [c.phone]);

    await run(
      `INSERT OR IGNORE INTO companies (
        user_id, company_name, category_id, city_id, area_id, phone, whatsapp, email, description, logo_url, cover_url, address, lat, lng, is_verified, verification_status, is_approved, is_available, rating_avg, rating_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)`,
      [
        u.id, c.company_name, c.cat, ghadames.id, c.area, c.phone, c.whatsapp, c.email, c.desc, c.logo, c.cover, c.address, c.lat, c.lng, c.verified, c.vStatus, c.rating, c.ratingCount
      ]
    );

    const insertedComp = await get(`SELECT id FROM companies WHERE user_id = ?`, [u.id]);

    await run(`INSERT INTO provider_images (provider_type, target_id, image_url, caption) VALUES (?, ?, ?, ?)`, [
      'company', insertedComp.id, 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80', 'مشروع مباني سكنية'
    ]);
  }

  // 8. Sample Customer & Reviews
  const custHash = await bcrypt.hash('cust123', 10);
  await run(
    `INSERT OR IGNORE INTO users (name, email, phone, password, role_id) VALUES (?, ?, ?, ?, ?)`,
    ['محمد علي الغدامسي', 'mohamed@gmail.com', '0915556677', custHash, customerRole.id]
  );
  const sampleCustomer = await get(`SELECT id FROM users WHERE phone = '0915556677'`);

  const firstProv = await get(`SELECT id FROM service_providers LIMIT 1`);
  if (firstProv) {
    await run(
      `INSERT INTO reviews (customer_id, provider_type, target_id, rating, comment, is_approved) VALUES (?, ?, ?, ?, ?, 1)`,
      [sampleCustomer.id, 'provider', firstProv.id, 5, 'خدمة ممتازة وسريعة جداً وأخلاق عالية في التعامل. أنصح به بشدة!']
    );
  }

  // 9. Sample Advertisement Banners
  await run(
    `INSERT INTO advertisements (title, image_url, description, link_url, city_id, placement, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [
      'عروض شركة واحة غدامس للمقاولات',
      'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=1200&q=80',
      'خصم 15% على أعمال التشطيبات والترميم لفترة محدودة',
      '#',
      ghadames.id,
      'home_top'
    ]
  );

  console.log('✅ Database Seeding Completed Successfully!');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
});
