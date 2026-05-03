const express = require('express');
const router = express.Router();
const pool = require('../db');

// Middleware protection admin
function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé'
    });
  }
  next();
}

// GET /api/admin/pages - Récupérer toutes les pages
router.get('/pages', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM pages
      ORDER BY slug ASC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur pages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// GET /api/admin/pages/:slug - Récupérer une page par slug
router.get('/pages/:slug', requireAdmin, async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM pages WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Page non trouvée'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur page:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// PATCH /api/admin/pages/:slug - Modifier une page
router.patch('/pages/:slug', requireAdmin, async (req, res) => {
  const { slug } = req.params;
  const {
    title_fr,
    title_en,
    content_fr,
    content_en,
    meta_title_fr,
    meta_title_en,
    meta_description_fr,
    meta_description_en,
    hero_image,
    is_published
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE pages
       SET title_fr = COALESCE($1, title_fr),
           title_en = COALESCE($2, title_en),
           content_fr = COALESCE($3, content_fr),
           content_en = COALESCE($4, content_en),
           meta_title_fr = COALESCE($5, meta_title_fr),
           meta_title_en = COALESCE($6, meta_title_en),
           meta_description_fr = COALESCE($7, meta_description_fr),
           meta_description_en = COALESCE($8, meta_description_en),
           hero_image = COALESCE($9, hero_image),
           is_published = COALESCE($10, is_published),
           updated_at = CURRENT_TIMESTAMP
       WHERE slug = $11
       RETURNING *`,
      [
        title_fr,
        title_en,
        content_fr,
        content_en,
        meta_title_fr,
        meta_title_en,
        meta_description_fr,
        meta_description_en,
        hero_image,
        is_published,
        slug
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Page non trouvée'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Page modifiée avec succès'
    });
  } catch (error) {
    console.error('Erreur modification page:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;