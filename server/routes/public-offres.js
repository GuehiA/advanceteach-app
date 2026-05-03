const express = require('express');
const router = express.Router();
const pool = require('../db');

function getLang(req) {
  return req.query.lang === 'fr' ? 'fr' : 'en';
}

// GET /api/offres?lang=en
router.get('/offres', async (req, res) => {
  const lang = getLang(req);

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        slug,
        image_path,
        document_path,
        status,
        is_featured,
        published_at,
        expires_at,
        CASE WHEN $1 = 'fr' THEN title_fr ELSE title_en END AS title,
        CASE WHEN $1 = 'fr' THEN short_desc_fr ELSE short_desc_en END AS short_description,
        CASE WHEN $1 = 'fr' THEN full_desc_fr ELSE full_desc_en END AS full_description
      FROM offers
      WHERE status = 'published'
      ORDER BY published_at DESC NULLS LAST, created_at DESC
      `,
      [lang]
    );

    res.json({
      success: true,
      lang,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur route publique offres :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;