const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/formations - Enregistrer une demande de formation
router.post('/', async (req, res) => {
  const {
    full_name,
    organization,
    email,
    phone,
    training_topic,
    participants_count,
    preferred_format,
    message,
    language
  } = req.body;

  if (!full_name || !organization || !email || !training_topic) {
    return res.status(400).json({
      success: false,
      message: 'Nom, organisation, email et sujet de formation sont requis'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO training_requests (
        full_name, organization, email, phone, training_topic,
        participants_count, preferred_format, message, language
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [
        full_name,
        organization,
        email,
        phone || null,
        training_topic,
        participants_count || null,
        preferred_format || null,
        message || null,
        language || 'fr'
      ]
    );

    res.json({
      success: true,
      message: 'Demande de formation enregistrée avec succès',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Erreur enregistrement formation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;