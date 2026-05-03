const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/recherche - Enregistrer une demande de projet de recherche
router.post('/', async (req, res) => {
  const {
    full_name,
    institution,
    email,
    phone,
    research_field,
    requested_platform_type,
    project_description,
    estimated_budget,
    desired_timeline,
    language
  } = req.body;

  if (!full_name || !institution || !email || !project_description) {
    return res.status(400).json({
      success: false,
      message: 'Nom, institution, email et description du projet sont requis'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO research_requests (
        full_name, institution, email, phone, research_field,
        requested_platform_type, project_description, estimated_budget,
        desired_timeline, language
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id`,
      [
        full_name,
        institution,
        email,
        phone || null,
        research_field || null,
        requested_platform_type || null,
        project_description,
        estimated_budget || null,
        desired_timeline || null,
        language || 'fr'
      ]
    );

    res.json({
      success: true,
      message: 'Projet de recherche enregistré avec succès',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Erreur enregistrement recherche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;