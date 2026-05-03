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

// GET /api/admin/projets - Récupérer tous les projets
router.get('/projets', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM projects
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur projets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// GET /api/admin/projets/:id - Récupérer un projet par ID
router.get('/projets/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// POST /api/admin/projets - Créer un projet
router.post('/projets', requireAdmin, async (req, res) => {
  const {
    title_fr,
    title_en,
    category,
    client_or_context,
    short_desc_fr,
    short_desc_en,
    image_path,
    is_featured,
    is_published,
    project_date
  } = req.body;

  if (!title_fr || !title_en) {
    return res.status(400).json({
      success: false,
      message: 'Les titres français et anglais sont requis'
    });
  }

  // Générer un slug à partir du titre français
  const slug = title_fr
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  try {
    const result = await pool.query(
      `INSERT INTO projects (
        slug, title_fr, title_en, category, client_or_context,
        short_desc_fr, short_desc_en, image_path, is_featured, is_published, project_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        slug,
        title_fr,
        title_en,
        category || null,
        client_or_context || null,
        short_desc_fr || null,
        short_desc_en || null,
        image_path || null,
        is_featured !== undefined ? is_featured : false,
        is_published !== undefined ? is_published : true,
        project_date || null
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Projet créé avec succès'
    });
  } catch (error) {
    console.error('Erreur création projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// PATCH /api/admin/projets/:id - Modifier un projet
router.patch('/projets/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    title_fr,
    title_en,
    category,
    client_or_context,
    short_desc_fr,
    short_desc_en,
    full_desc_fr,
    full_desc_en,
    solution_fr,
    solution_en,
    results_fr,
    results_en,
    technologies,
    image_path,
    external_url,
    is_featured,
    is_published,
    project_date
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE projects
       SET title_fr = COALESCE($1, title_fr),
           title_en = COALESCE($2, title_en),
           category = COALESCE($3, category),
           client_or_context = COALESCE($4, client_or_context),
           short_desc_fr = COALESCE($5, short_desc_fr),
           short_desc_en = COALESCE($6, short_desc_en),
           full_desc_fr = COALESCE($7, full_desc_fr),
           full_desc_en = COALESCE($8, full_desc_en),
           solution_fr = COALESCE($9, solution_fr),
           solution_en = COALESCE($10, solution_en),
           results_fr = COALESCE($11, results_fr),
           results_en = COALESCE($12, results_en),
           technologies = COALESCE($13, technologies),
           image_path = COALESCE($14, image_path),
           external_url = COALESCE($15, external_url),
           is_featured = COALESCE($16, is_featured),
           is_published = COALESCE($17, is_published),
           project_date = COALESCE($18, project_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $19
       RETURNING *`,
      [
        title_fr,
        title_en,
        category,
        client_or_context,
        short_desc_fr,
        short_desc_en,
        full_desc_fr,
        full_desc_en,
        solution_fr,
        solution_en,
        results_fr,
        results_en,
        technologies,
        image_path,
        external_url,
        is_featured,
        is_published,
        project_date,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Projet modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur modification projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// DELETE /api/admin/projets/:id - Supprimer un projet
router.delete('/projets/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Projet supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;