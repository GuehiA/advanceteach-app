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

// GET /api/admin/demandes - Récupérer toutes les demandes de devis
router.get('/demandes', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM quote_requests
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur demandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// GET /api/admin/contacts - Récupérer tous les messages de contact
router.get('/contacts', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM contact_requests
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// GET /api/admin/trainings - Récupérer toutes les demandes de formation
router.get('/trainings', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM training_requests
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur formations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// GET /api/admin/research - Récupérer toutes les demandes de recherche
router.get('/research', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM research_requests
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur recherches:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// PATCH /api/admin/demandes/:id/status - Mettre à jour le statut d'une demande de devis
router.patch('/demandes/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Statuts selon la structure PostgreSQL
  if (!['new', 'read', 'processed', 'archived'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Statut invalide'
    });
  }

  try {
    await pool.query(
      'UPDATE quote_requests SET status = $1 WHERE id = $2',
      [status, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// PATCH /api/admin/contacts/:id/status
router.patch('/contacts/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['new', 'read', 'processed', 'archived'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Statut invalide'
    });
  }

  try {
    await pool.query(
      'UPDATE contact_requests SET status = $1 WHERE id = $2',
      [status, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour statut contact:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// PATCH /api/admin/trainings/:id/status
router.patch('/trainings/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['new', 'read', 'processed', 'archived'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Statut invalide'
    });
  }

  try {
    await pool.query(
      'UPDATE training_requests SET status = $1 WHERE id = $2',
      [status, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour statut formation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// PATCH /api/admin/research/:id/status
router.patch('/research/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['new', 'read', 'processed', 'archived'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Statut invalide'
    });
  }

  try {
    await pool.query(
      'UPDATE research_requests SET status = $1 WHERE id = $2',
      [status, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour statut recherche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// DELETE /api/admin/demandes/:id
router.delete('/demandes/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM quote_requests WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }

    res.json({ success: true, message: 'Demande supprimée' });
  } catch (error) {
    console.error('Erreur suppression demande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// DELETE /api/admin/contacts/:id
router.delete('/contacts/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM contact_requests WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.json({ success: true, message: 'Message supprimé' });
  } catch (error) {
    console.error('Erreur suppression message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// DELETE /api/admin/trainings/:id
router.delete('/trainings/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM training_requests WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Demande de formation non trouvée'
      });
    }

    res.json({ success: true, message: 'Demande de formation supprimée' });
  } catch (error) {
    console.error('Erreur suppression formation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// DELETE /api/admin/research/:id
router.delete('/research/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM research_requests WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Projet de recherche non trouvé'
      });
    }

    res.json({ success: true, message: 'Projet de recherche supprimé' });
  } catch (error) {
    console.error('Erreur suppression recherche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;