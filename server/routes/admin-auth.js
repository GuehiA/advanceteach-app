const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../db');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis.'
      });
    }

    const result = await pool.query(
      `SELECT id, username, email, password_hash, full_name, role, is_active
       FROM admins
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides.'
      });
    }

    const admin = result.rows[0];

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Compte administrateur désactivé.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides.'
      });
    }

    req.session.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role
    };

    return res.json({
      success: true,
      message: 'Connexion réussie.',
      admin: req.session.admin
    });
  } catch (error) {
    console.error('Erreur /api/admin/login :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
});

router.get('/check', (req, res) => {
  if (!req.session.admin) {
    return res.json({ loggedIn: false });
  }

  return res.json({
    loggedIn: true,
    admin: req.session.admin
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la déconnexion.'
      });
    }

    res.clearCookie('connect.sid');

    return res.json({
      success: true,
      message: 'Déconnexion réussie.'
    });
  });
});

module.exports = router;