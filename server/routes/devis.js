const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const {
      full_name,
      organization,
      email,
      phone,
      requested_service,
      estimated_budget,
      desired_timeline,
      project_description,
      language
    } = req.body;

    if (!full_name || !email || !project_description) {
      return res.status(400).json({
        success: false,
        message: 'Les champs full_name, email et project_description sont obligatoires.'
      });
    }

    const query = `
      INSERT INTO quote_requests (
        full_name,
        organization,
        email,
        phone,
        requested_service,
        estimated_budget,
        desired_timeline,
        project_description,
        language
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, full_name, email, created_at
    `;

    const values = [
      full_name,
      organization || null,
      email,
      phone || null,
      requested_service || null,
      estimated_budget || null,
      desired_timeline || null,
      project_description,
      language || 'en'
    ];

    const result = await pool.query(query, values);

    return res.status(201).json({
      success: true,
      message: 'Quote request saved successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur route /api/devis :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l’enregistrement du devis.'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        full_name,
        organization,
        email,
        phone,
        requested_service,
        estimated_budget,
        desired_timeline,
        project_description,
        language,
        status,
        created_at
      FROM quote_requests
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur GET /api/devis :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la lecture des devis.'
    });
  }
});

module.exports = router;