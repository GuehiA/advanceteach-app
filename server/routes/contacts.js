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
      subject,
      request_type,
      message,
      language
    } = req.body;

    if (!full_name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Les champs full_name, email et message sont obligatoires.'
      });
    }

    const query = `
      INSERT INTO contact_requests (
        full_name,
        organization,
        email,
        phone,
        subject,
        request_type,
        message,
        language
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, full_name, email, created_at
    `;

    const values = [
      full_name,
      organization || null,
      email,
      phone || null,
      subject || null,
      request_type || 'contact',
      message,
      language || 'fr'
    ];

    const result = await pool.query(query, values);

    return res.status(201).json({
      success: true,
      message: 'Message enregistré avec succès.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur route /api/contacts :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l’enregistrement du message.'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name, organization, email, phone, subject, request_type, message, language, status, created_at
      FROM contact_requests
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur GET /api/contacts :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la lecture des messages.'
    });
  }
});

module.exports = router;