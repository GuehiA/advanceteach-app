const express = require('express');
const router = express.Router();
const pool = require('../db');

// Protection des routes administrateur
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé'
    });
  }

  next();
}

// GET /api/admin/pages
router.get('/pages', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM pages
      ORDER BY slug ASC
    `);

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur GET /api/admin/pages :', error);

    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du chargement des pages'
    });
  }
});

// POST /api/admin/pages
router.post('/pages', requireAdmin, async (req, res) => {
  try {
    const {
      slug,
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

    const normalizedSlug = String(slug || '')
      .trim()
      .toLowerCase();

    if (!normalizedSlug) {
      return res.status(400).json({
        success: false,
        message: 'Le slug est obligatoire'
      });
    }

    if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
      return res.status(400).json({
        success: false,
        message:
          'Le slug peut uniquement contenir des lettres minuscules, des chiffres et des tirets'
      });
    }

    const existingPage = await pool.query(
      `
        SELECT id
        FROM pages
        WHERE slug = $1
        LIMIT 1
      `,
      [normalizedSlug]
    );

    if (existingPage.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Une page avec ce slug existe déjà'
      });
    }

    const result = await pool.query(
      `
        INSERT INTO pages (
          slug,
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
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11
        )
        RETURNING *
      `,
      [
        normalizedSlug,
        title_fr || '',
        title_en || '',
        content_fr || '',
        content_en || '',
        meta_title_fr || '',
        meta_title_en || '',
        meta_description_fr || '',
        meta_description_en || '',
        hero_image || '',
        is_published === undefined ? true : Boolean(is_published)
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Page créée avec succès',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur POST /api/admin/pages :', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Une page avec ce slug existe déjà'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la page',
      error: error.message
    });
  }
});

// GET /api/admin/pages/:slug
router.get('/pages/:slug', requireAdmin, async (req, res) => {
  const slug = String(req.params.slug || '')
    .trim()
    .toLowerCase();

  try {
    const result = await pool.query(
      `
        SELECT *
        FROM pages
        WHERE slug = $1
        LIMIT 1
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Page non trouvée'
      });
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur GET /api/admin/pages/:slug :', error);

    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du chargement de la page'
    });
  }
});

// PATCH /api/admin/pages/:slug
router.patch('/pages/:slug', requireAdmin, async (req, res) => {
  const slug = String(req.params.slug || '')
    .trim()
    .toLowerCase();

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
      `
        UPDATE pages
        SET
          title_fr = COALESCE($1, title_fr),
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
        RETURNING *
      `,
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

    return res.json({
      success: true,
      message: 'Page modifiée avec succès',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur PATCH /api/admin/pages/:slug :', error);

    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la modification de la page',
      error: error.message
    });
  }
});

module.exports = router;