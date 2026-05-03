const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
require('dotenv').config();

const pool = require('./db');
const contactsRouter = require('./routes/contacts');
const devisRouter = require('./routes/devis');
const adminAuthRouter = require('./routes/admin-auth');
const adminDemandesRouter = require('./routes/admin-demandes');
const adminOffresRouter = require('./routes/admin-offres');
const adminServicesRouter = require('./routes/admin-services');
const adminProjetsRouter = require('./routes/admin-projets');
const adminPagesRouter = require('./routes/admin-pages');
const adminMediaRouter = require('./routes/admin-media');
const adminSectionsRouter = require('./routes/admin-sections');

// Routes publiques (front-office bilingue)
const publicPagesRouter = require('./routes/public-pages');
const publicServicesRouter = require('./routes/public-services');
const publicProjetsRouter = require('./routes/public-projets');
const publicOffresRouter = require('./routes/public-offres');
const publicSectionsRouter = require('./routes/public-sections');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  store: new PgSession({
    pool,
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API AdvanceTeach opérationnelle'
  });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    res.json({
      success: true,
      message: 'Connexion PostgreSQL réussie',
      server_time: result.rows[0].current_time
    });
  } catch (error) {
    console.error('Erreur test DB :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur de connexion à la base de données',
      error: error.message
    });
  }
});

// ========== ROUTES API ==========

// Routes pour le formulaire public
app.use('/api/contacts', contactsRouter);
app.use('/api/devis', devisRouter);

// Routes pour l'administration (back-office)
app.use('/api/admin', adminAuthRouter);
app.use('/api/admin', adminDemandesRouter);
app.use('/api/admin', adminOffresRouter);
app.use('/api/admin', adminServicesRouter);
app.use('/api/admin', adminProjetsRouter);
app.use('/api/admin', adminPagesRouter);
app.use('/api/admin', adminMediaRouter);
app.use('/api/admin', adminSectionsRouter);

// Routes publiques pour le front-office bilingue
app.use('/api', publicPagesRouter);
app.use('/api', publicServicesRouter);
app.use('/api', publicProjetsRouter);
app.use('/api', publicOffresRouter);
app.use('/api', publicSectionsRouter);

// Route accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Gestion 404 API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route API introuvable'
  });
});

// Gestion erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});