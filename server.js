require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { sequelize, testConnection } = require('./config/database');
const models = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));

var allowedOrigins = ['http://localhost:5000', 'http://127.0.0.1:5000'];
if (process.env.APP_URL) allowedOrigins.push(process.env.APP_URL);

app.use(cors({
  origin: function(origin, cb) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'production') {
      cb(null, true);
    } else {
      cb(null, true);
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Trop de requêtes. Veuillez réessayer plus tard.' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de tentatives. Veuillez réessayer plus tard.' }
});
app.use('/api/auth/', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/logo.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'logo.jpg'));
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/rent', require('./routes/rent'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/home', require('./routes/home'));

// Admin SPA fallback
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// Main SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err.message);
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `Erreur d'upload: ${err.message}` });
  }
  res.status(500).json({ error: 'Erreur interne du serveur.' });
});

// Start
const startServer = async () => {
  await testConnection();

  await sequelize.sync({ alter: false });
  console.log('[DB] Models synchronized.');

  // Add wilayas column if it doesn't exist (for existing databases)
  try {
    await sequelize.query("ALTER TABLE products ADD COLUMN wilayas TEXT");
    console.log('[DB] Added wilayas column.');
  } catch (e) {
    // Column already exists — ignore
  }

  // Auto-seed products if the table is empty
  try {
    var count = await models.Product.count();
    if (count === 0) {
      var seedData = [
        { name: 'Ciment CEM I 42.5', name_ar: 'اسمنت CEM I 42.5', description: 'Ciment Portland pour construction générale, livraison en sacs de 50kg', price: 850, rent_price: null, type: 'sell', quantity: 500, status: 'available', featured: true },
        { name: 'Fer à béton 12mm', name_ar: 'حديد التسليح 12 مم', description: 'Fer à béton torr qualité supérieure, paquet de 10 barres', price: 2400, rent_price: null, type: 'sell', quantity: 200, status: 'available', featured: true },
        { name: 'Pelle mécanique', name_ar: 'حفارة ميكانيكية', description: 'Pelle mécanique pour travaux de terrassement, location à la journée', price: 150000, rent_price: 12000, type: 'both', quantity: 3, status: 'available', featured: true, rent_price_per: 'day' },
        { name: 'Bétonnière 350L', name_ar: 'خلاطة خرسانة 350 لتر', description: 'Bétonnière électrique 350L pour chantier', price: 85000, rent_price: 5000, type: 'both', quantity: 5, status: 'available', featured: true, rent_price_per: 'day' },
        { name: 'Carreaux de céramique 60x60', name_ar: 'بلاط سيراميك 60×60', description: 'Carreaux de céramique grès cérame aspect marbre, boîte de 4 pièces', price: 3200, rent_price: null, type: 'sell', quantity: 150, status: 'available', featured: true },
        { name: 'Échafaudage métallique', name_ar: 'سقالة معدنية', description: 'Échafaudage métallique modulaire, hauteur 5m, lot complet', price: 120000, rent_price: 2500, type: 'both', quantity: 8, status: 'available', featured: false, rent_price_per: 'day' },
        { name: 'Peinture mate blanc 10L', name_ar: 'طلاء غير لامع أبيض 10 لتر', description: 'Peinture acrylique mate de haute qualité, blanc pur, 10L', price: 4500, rent_price: null, type: 'sell', quantity: 80, status: 'available', featured: false },
        { name: 'Camion-benne 10m³', name_ar: 'شاحنة قلابة 10 متر مكعب', description: 'Camion-benne pour transport de matériaux, location avec chauffeur', price: 2800000, rent_price: 35000, type: 'rent', quantity: 2, status: 'available', featured: true, rent_price_per: 'day' },
        { name: 'Sable de construction 1m³', name_ar: 'رمل بناء 1 متر مكعب', description: 'Sable de construction lavé, livraison en camion', price: 3500, rent_price: null, type: 'sell', quantity: 100, status: 'available', featured: false },
        { name: 'Marteau-piqueur perforateur', name_ar: 'مطرقة كهربائية', description: 'Marteau-piqueur perforateur SDS-Max 1500W', price: 45000, rent_price: 2500, type: 'both', quantity: 6, status: 'available', featured: false, rent_price_per: 'day' },
        { name: 'Tuyaux PVC 110mm', name_ar: 'أنابيب بي في سي 110 مم', description: 'Tuyaux PVC pour evacuation, longueur 3m, lot de 10', price: 2800, rent_price: null, type: 'sell', quantity: 200, status: 'available', featured: false },
        { name: 'Niveau laser rotatif', name_ar: 'ميزان ليزر دوار', description: 'Niveau laser rotatif professionnel portée 500m', price: 65000, rent_price: 3000, type: 'both', quantity: 4, status: 'available', featured: false, rent_price_per: 'day' }
      ];
      for (var si = 0; si < seedData.length; si++) {
        var prod = await models.Product.create(seedData[si]);
        await models.ProductImage.create({ product_id: prod.id, image_url: '/assets/placeholder.svg', is_primary: true });
      }
      console.log('[DB] Auto-seeded ' + seedData.length + ' products.');
    } else {
      console.log('[DB] Products table has ' + count + ' rows, skipping seed.');
    }
  } catch (e) {
    console.log('[DB] Product seed check error (non-fatal):', e.message);
  }

  // Auto-seed admin if the table is empty
  try {
    var adminCount = await models.Admin.count();
    if (adminCount === 0) {
      var bcrypt = require('bcryptjs');
      var hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin215', 12);
      await models.Admin.create({
        phone: process.env.ADMIN_PHONE || '0215',
        password: hashedPassword,
        name: 'Administrateur',
        role: 'super_admin'
      });
      console.log('[DB] Admin account created: ' + (process.env.ADMIN_PHONE || '0215'));
    } else {
      console.log('[DB] Admin table has ' + adminCount + ' row(s), skipping seed.');
    }
  } catch (e) {
    console.log('[DB] Admin seed check error (non-fatal):', e.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n═══════════════════════════════════════════`);
    console.log(`  BATI Nova - Server Running`);
    console.log(`  Port: ${PORT}`);
    console.log(`  URL: ${process.env.APP_URL || `http://localhost:${PORT}`}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`═══════════════════════════════════════════\n`);
  });
};

startServer().catch(err => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});

module.exports = app;
