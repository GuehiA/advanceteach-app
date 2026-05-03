const express = require('express');
const router = express.Router();
const pool = require('../db');

function getLang(req) {
  return req.query.lang === 'fr' ? 'fr' : 'en';
}

// GET /api/pages/:slug?lang=en
router.get('/pages/:slug', async (req, res) => {
  const { slug } = req.params;
  const lang = getLang(req);

  try {
    const result = await pool.query(
      `
      SELECT
        slug,
        hero_image,
        is_published,
        CASE WHEN $2 = 'fr' THEN title_fr ELSE title_en END AS title,
        CASE WHEN $2 = 'fr' THEN content_fr ELSE content_en END AS content,
        CASE WHEN $2 = 'fr' THEN meta_title_fr ELSE meta_title_en END AS meta_title,
        CASE WHEN $2 = 'fr' THEN meta_description_fr ELSE meta_description_en END AS meta_description
      FROM pages
      WHERE slug = $1
        AND is_published = true
      LIMIT 1
      `,
      [slug, lang]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Page non trouvée'
      });
    }

    res.json({
      success: true,
      lang,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur route publique pages :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;