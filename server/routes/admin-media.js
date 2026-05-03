const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pool = require('../db');

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function slugifyFileName(name) {
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé'
    });
  }
  next();
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      ensureUploadDir();
      cb(null, UPLOAD_DIR);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const baseName = path.basename(file.originalname || 'file', ext);
    const safeBase = slugifyFileName(baseName) || 'file';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ]);

  if (allowedTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

function safeUnlink(fileAbsolutePath) {
  try {
    if (fs.existsSync(fileAbsolutePath)) {
      fs.unlinkSync(fileAbsolutePath);
    }
  } catch (error) {
    console.error('Erreur suppression fichier disque:', error);
  }
}

// POST /api/admin/media/upload
router.post('/media/upload', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Aucun fichier uploadé'
    });
  }

  const {
    originalname,
    filename,
    mimetype,
    size
  } = req.file;

  const filePath = `/uploads/${filename}`;
  const adminId = req.session.admin.id;

  try {
    const result = await pool.query(
      `INSERT INTO media (
        filename,
        original_name,
        mime_type,
        file_path,
        uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, filename, original_name, mime_type, file_path, created_at`,
      [filename, originalname, mimetype, filePath, adminId]
    );

    return res.json({
      success: true,
      message: 'Fichier uploadé avec succès',
      data: {
        ...result.rows[0],
        size,
        url: filePath
      }
    });
  } catch (error) {
    safeUnlink(path.join(UPLOAD_DIR, filename));

    console.error('Erreur insertion media:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// GET /api/admin/media
router.get('/media', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.*,
        a.username AS uploaded_by_name
      FROM media m
      LEFT JOIN admins a ON m.uploaded_by = a.id
      ORDER BY m.created_at DESC
    `);

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(item => ({
        ...item,
        url: item.file_path
      }))
    });
  } catch (error) {
    console.error('Erreur media:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// GET /api/admin/media/:id
router.get('/media/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        m.*,
        a.username AS uploaded_by_name
      FROM media m
      LEFT JOIN admins a ON m.uploaded_by = a.id
      WHERE m.id = $1
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Média non trouvé'
      });
    }

    return res.json({
      success: true,
      data: {
        ...result.rows[0],
        url: result.rows[0].file_path
      }
    });
  } catch (error) {
    console.error('Erreur lecture média:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// DELETE /api/admin/media/:id
router.delete('/media/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const mediaResult = await pool.query(
      'SELECT id, file_path, filename FROM media WHERE id = $1 LIMIT 1',
      [id]
    );

    if (mediaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Média non trouvé'
      });
    }

    const media = mediaResult.rows[0];
    const absoluteFilePath = path.join(__dirname, '../../public', media.file_path);

    await pool.query('DELETE FROM media WHERE id = $1', [id]);
    safeUnlink(absoluteFilePath);

    return res.json({
      success: true,
      message: 'Média supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression média:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Middleware d’erreurs multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux (max 5MB)'
      });
    }
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur upload'
    });
  }

  next();
});

module.exports = router;