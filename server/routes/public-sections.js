const express = require('express');
const router = express.Router();
const pool = require('../db');

function getLang(req) {
  return req.query.lang === 'fr' ? 'fr' : 'en';
}

// GET /api/sections/:pageSlug?lang=fr
router.get('/sections/:pageSlug', async (req, res) => {
  const { pageSlug } = req.params;
  const lang = getLang(req);

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        page_slug,
        section_key,
        section_type,
        image_path,
        button_link,
        display_order,
        is_active,
        CASE WHEN $2 = 'fr' THEN title_fr ELSE title_en END AS title,
        CASE WHEN $2 = 'fr' THEN content_fr ELSE content_en END AS content,
        CASE WHEN $2 = 'fr' THEN button_text_fr ELSE button_text_en END AS button_text
      FROM page_sections
      WHERE page_slug = $1
        AND is_active = true
      ORDER BY display_order ASC, id ASC
      `,
      [pageSlug, lang]
    );

    res.json({
      success: true,
      lang,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur sections publiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;