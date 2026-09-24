const { query } = require('./database');

async function findByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE lower(email) = lower($1)', [email]);
  return rows[0];
}

async function findById(id) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
}

async function insertUser(user) {
  await query(
    'INSERT INTO users (id, name, email, password_hash, created_at) VALUES ($1, $2, $3, $4, $5)',
    [user.id, user.name, user.email, user.passwordHash, user.createdAt]
  );
  return user;
}

module.exports = { findByEmail, findById, insertUser };
