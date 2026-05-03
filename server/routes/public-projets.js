const express = require('express');
const router = express.Router();
const pool = require('../db');

function getLang(req) {
  return req.query.lang === 'fr' ? 'fr' : 'en';
}

// GET /api/projets?lang=en
router.get('/projets', async (req, res) => {
  const lang = getLang(req);

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        slug,
        category,
        client_or_context,
        technologies,
        image_path,
        external_url,
        is_featured,
        is_published,
        project_date,
        CASE WHEN $1 = 'fr' THEN title_fr ELSE title_en END AS title,
        CASE WHEN $1 = 'fr' THEN short_desc_fr ELSE short_desc_en END AS short_description,
        CASE WHEN $1 = 'fr' THEN full_desc_fr ELSE full_desc_en END AS full_description,
        CASE WHEN $1 = 'fr' THEN solution_fr ELSE solution_en END AS solution,
        CASE WHEN $1 = 'fr' THEN results_fr ELSE results_en END AS results
      FROM projects
      WHERE is_published = true
      ORDER BY created_at DESC
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
    console.error('Erreur route publique projets :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;