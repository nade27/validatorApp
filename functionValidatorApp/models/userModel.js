const pool = require('../config/db');

const createUserTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      NIP VARCHAR(50) NOT NULL UNIQUE,
      nama VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      dept VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(sql);
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

const findUserByNIP = async (NIP) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE NIP = ?', [NIP]);
  return rows[0];
};

const createUser = async (user) => {
  const { NIP, nama, email, password, role, dept } = user;
  const sql = 'INSERT INTO users (NIP, nama, email, password, role, dept) VALUES (?, ?, ?, ?, ?, ?)';
  const [result] = await pool.query(sql, [NIP, nama, email, password, role, dept]);
  return result.insertId;
};

module.exports = {
  createUserTable,
  findUserByEmail,
  findUserByNIP,
  createUser
};
