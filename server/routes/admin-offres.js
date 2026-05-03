const express = require('express');
const router = express.Router();
const pool = require('../db');

function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé'
    });
  }
  next();
}

// GET /api/admin/offres
router.get('/offres', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM offers
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur offres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// GET /api/admin/offres/:id
router.get('/offres/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM offers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// POST /api/admin/offres
router.post('/offres', requireAdmin, async (req, res) => {
  const {
    title_fr,
    title_en,
    short_desc_fr,
    short_desc_en,
    full_desc_fr,
    full_desc_en,
    image_path,
    document_path,
    status,
    is_featured,
    published_at,
    expires_at
  } = req.body;

  if (!title_fr || !title_en) {
    return res.status(400).json({
      success: false,
      message: 'Les titres français et anglais sont requis'
    });
  }

  const slug = title_fr
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  try {
    const result = await pool.query(
      `INSERT INTO offers (
        slug,
        title_fr,
        title_en,
        short_desc_fr,
        short_desc_en,
        full_desc_fr,
        full_desc_en,
        image_path,
        document_path,
        status,
        is_featured,
        published_at,
        expires_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        slug,
        title_fr,
        title_en,
        short_desc_fr || null,
        short_desc_en || null,
        full_desc_fr || null,
        full_desc_en || null,
        image_path || null,
        document_path || null,
        status || 'draft',
        is_featured !== undefined ? is_featured : false,
        published_at || null,
        expires_at || null
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Offre créée avec succès'
    });
  } catch (error) {
    console.error('Erreur création offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// PATCH /api/admin/offres/:id
router.patch('/offres/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    title_fr,
    title_en,
    short_desc_fr,
    short_desc_en,
    full_desc_fr,
    full_desc_en,
    image_path,
    document_path,
    status,
    is_featured,
    published_at,
    expires_at
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE offers
       SET title_fr = COALESCE($1, title_fr),
           title_en = COALESCE($2, title_en),
           short_desc_fr = COALESCE($3, short_desc_fr),
           short_desc_en = COALESCE($4, short_desc_en),
           full_desc_fr = COALESCE($5, full_desc_fr),
           full_desc_en = COALESCE($6, full_desc_en),
           image_path = COALESCE($7, image_path),
           document_path = COALESCE($8, document_path),
           status = COALESCE($9, status),
           is_featured = COALESCE($10, is_featured),
           published_at = COALESCE($11, published_at),
           expires_at = COALESCE($12, expires_at),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [
        title_fr,
        title_en,
        short_desc_fr,
        short_desc_en,
        full_desc_fr,
        full_desc_en,
        image_path,
        document_path,
        status,
        is_featured,
        published_at,
        expires_at,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Offre modifiée avec succès'
    });
  } catch (error) {
    console.error('Erreur modification offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// DELETE /api/admin/offres/:id
router.delete('/offres/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM offers WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Offre supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;