const pool = require('./db');
const bcrypt = require('bcrypt');

async function initDatabase() {
  try {
    console.log('📦 Initialisation complémentaire de la base...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        sid varchar NOT NULL PRIMARY KEY,
        sess json NOT NULL,
        expire timestamp(6) NOT NULL
      )
    `);

    const adminEmail = 'admin@advanceteach.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await pool.query(
      `
      UPDATE admins
      SET password_hash = $1
      WHERE email = $2
      `,
      [hashedPassword, adminEmail]
    );

    console.log('✅ Session table prête et mot de passe admin mis à jour.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur init-db :', error);
    process.exit(1);
  }
}

initDatabase();