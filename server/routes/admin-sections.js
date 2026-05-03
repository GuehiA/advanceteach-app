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

// GET /api/admin/sections/:pageSlug
router.get('/sections/:pageSlug', requireAdmin, async (req, res) => {
  const { pageSlug } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM page_sections
      WHERE page_slug = $1
      ORDER BY display_order ASC, id ASC
      `,
      [pageSlug]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur lecture sections:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// POST /api/admin/sections
router.post('/sections', requireAdmin, async (req, res) => {
  const {
    page_slug,
    section_key,
    section_type,
    title_fr,
    title_en,
    content_fr,
    content_en,
    image_path,
    button_text_fr,
    button_text_en,
    button_link,
    display_order,
    is_active
  } = req.body;

  if (!page_slug || !section_key) {
    return res.status(400).json({
      success: false,
      message: 'page_slug et section_key sont requis'
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO page_sections (
        page_slug, section_key, section_type,
        title_fr, title_en,
        content_fr, content_en,
        image_path,
        button_text_fr, button_text_en,
        button_link,
        display_order,
        is_active
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
      `,
      [
        page_slug,
        section_key,
        section_type || 'text',
        title_fr || null,
        title_en || null,
        content_fr || null,
        content_en || null,
        image_path || null,
        button_text_fr || null,
        button_text_en || null,
        button_link || null,
        Number.isInteger(display_order) ? display_order : 0,
        typeof is_active === 'boolean' ? is_active : true
      ]
    );

    res.json({
      success: true,
      message: 'Section créée avec succès',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur création section:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// PATCH /api/admin/sections/:id
router.patch('/sections/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    title_fr,
    title_en,
    content_fr,
    content_en,
    image_path,
    button_text_fr,
    button_text_en,
    button_link,
    display_order,
    is_active
  } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE page_sections
      SET
        title_fr = COALESCE($1, title_fr),
        title_en = COALESCE($2, title_en),
        content_fr = COALESCE($3, content_fr),
        content_en = COALESCE($4, content_en),
        image_path = COALESCE($5, image_path),
        button_text_fr = COALESCE($6, button_text_fr),
        button_text_en = COALESCE($7, button_text_en),
        button_link = COALESCE($8, button_link),
        display_order = COALESCE($9, display_order),
        is_active = COALESCE($10, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
      `,
      [
        title_fr,
        title_en,
        content_fr,
        content_en,
        image_path,
        button_text_fr,
        button_text_en,
        button_link,
        display_order,
        is_active,
        id
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Section non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Section mise à jour avec succès',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur update section:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// DELETE /api/admin/sections/:id
router.delete('/sections/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM page_sections WHERE id = $1 RETURNING id',
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Section non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Section supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression section:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;