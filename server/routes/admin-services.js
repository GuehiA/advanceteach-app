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

// GET /api/admin/services
router.get('/services', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM services
      ORDER BY display_order ASC, created_at DESC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Erreur services:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/admin/services/:id
router.get('/services/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service non trouvé' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erreur service:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/admin/services
router.post('/services', requireAdmin, async (req, res) => {
  const {
    title_fr, title_en, short_desc_fr, short_desc_en,
    full_desc_fr, full_desc_en, icon, image_path,
    display_order, is_active, is_featured
  } = req.body;

  if (!title_fr || !title_en) {
    return res.status(400).json({ success: false, message: 'Les titres français et anglais sont requis' });
  }

  const slug = title_fr
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  try {
    const result = await pool.query(
      `INSERT INTO services (
        slug, title_fr, title_en, short_desc_fr, short_desc_en,
        full_desc_fr, full_desc_en, icon, image_path,
        display_order, is_active, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [slug, title_fr, title_en, short_desc_fr || null, short_desc_en || null,
       full_desc_fr || null, full_desc_en || null, icon || null, image_path || null,
       display_order || 0, is_active !== undefined ? is_active : true,
       is_featured !== undefined ? is_featured : false]
    );
    res.json({ success: true, data: result.rows[0], message: 'Service créé avec succès' });
  } catch (error) {
    console.error('Erreur création service:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PATCH /api/admin/services/:id
router.patch('/services/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    title_fr, title_en, short_desc_fr, short_desc_en,
    full_desc_fr, full_desc_en, icon, image_path,
    display_order, is_active, is_featured
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE services
       SET title_fr = COALESCE($1, title_fr),
           title_en = COALESCE($2, title_en),
           short_desc_fr = COALESCE($3, short_desc_fr),
           short_desc_en = COALESCE($4, short_desc_en),
           full_desc_fr = COALESCE($5, full_desc_fr),
           full_desc_en = COALESCE($6, full_desc_en),
           icon = COALESCE($7, icon),
           image_path = COALESCE($8, image_path),
           display_order = COALESCE($9, display_order),
           is_active = COALESCE($10, is_active),
           is_featured = COALESCE($11, is_featured),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [title_fr, title_en, short_desc_fr, short_desc_en, full_desc_fr, full_desc_en,
       icon, image_path, display_order, is_active, is_featured, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service non trouvé' });
    }
    res.json({ success: true, data: result.rows[0], message: 'Service modifié avec succès' });
  } catch (error) {
    console.error('Erreur modification service:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/admin/services/:id
router.delete('/services/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service non trouvé' });
    }
    res.json({ success: true, message: 'Service supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression service:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;