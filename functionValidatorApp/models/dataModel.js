const pool = require('../config/db');

const createDataTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS data_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nopol VARCHAR(50) NOT NULL,
      nokir VARCHAR(50) NOT NULL,
      sopir VARCHAR(100) NOT NULL,
      PA VARCHAR(100) NOT NULL,
      jenistruk VARCHAR(100) NOT NULL,
      pbox FLOAT NOT NULL,
      lbox FLOAT NOT NULL,
      tbox FLOAT NOT NULL,
      volbox FLOAT NOT NULL,
      tonase FLOAT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(sql);
};

const createVendorTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS vendor (
      id INT AUTO_INCREMENT PRIMARY KEY,
      PA VARCHAR(100) UNIQUE NOT NULL
    )
  `;
  await pool.query(sql);
};

const createValidasiTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS validasi (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_data_entries INT NOT NULL,
      nama_users VARCHAR(100) NOT NULL,
      nip_users VARCHAR(50) NOT NULL,
      status_validasi VARCHAR(50) NOT NULL DEFAULT 'Proses Approval',
      stnk_pic VARCHAR(255),
      card_pic VARCHAR(255),
      create_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approval_timestamp TIMESTAMP NULL DEFAULT NULL,
      FOREIGN KEY (id_data_entries) REFERENCES data_entries(id)
    )
  `;
  await pool.query(sql);
};

const checkNopolExists = async (nopol) => {
  const sql = `
    SELECT COUNT(*) as count FROM data_entries WHERE nopol = ?
  `;
  const [rows] = await pool.query(sql, [nopol]);
  return rows[0].count > 0;
};

const checkPAExists = async (PA) => {
  const sql = `
    SELECT id FROM vendor WHERE PA = ?
  `;
  const [rows] = await pool.query(sql, [PA]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  return null;
};

const insertPA = async (PA) => {
  const sql = `
    INSERT INTO vendor (PA) VALUES (?)
  `;
  const [result] = await pool.query(sql, [PA]);
  return result.insertId;
};

const insertData = async (data) => {
  const { nopol, nokir, sopir, PA, jenistruk, pbox, lbox, tbox, volbox, tonase } = data;

  // Check if PA exists in vendor table, if not insert it
  let paId = await checkPAExists(PA);
  if (!paId) {
    paId = await insertPA(PA);
  }

  const sql = `
    INSERT INTO data_entries (nopol, nokir, sopir, PA, jenistruk, pbox, lbox, tbox, volbox, tonase)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [nopol, nokir, sopir, PA, jenistruk, pbox, lbox, tbox, volbox, tonase]);
  return result.insertId;
};

const getDataByNopolAndPA = async (nopol, PA) => {
  const sql = `
    SELECT * FROM data_entries WHERE nopol = ? AND PA = ?
  `;
  const [rows] = await pool.query(sql, [nopol, PA]);
  return rows;
};

const insertValidasi = async (validasiData) => {
  const { id_data_entries, nama_users, nip_users, stnk_pic, card_pic } = validasiData;
  const sql = `
    INSERT INTO validasi (id_data_entries, nama_users, nip_users, stnk_pic, card_pic)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [id_data_entries, nama_users, nip_users, stnk_pic, card_pic]);
  return result.insertId;
};

const getDataEntryById = async (id) => {
  const sql = `
    SELECT nopol, PA, sopir FROM data_entries WHERE id = ?
  `;
  const [rows] = await pool.query(sql, [id]);
  return rows.length > 0 ? rows[0] : null;
};

const updateValidasiStatus = async (id, status_validasi, nama_approver) => {
  let sql;
  let params;
  if (status_validasi === 'Approved') {
    sql = `
      UPDATE validasi SET status_validasi = ?, approval_timestamp = CURRENT_TIMESTAMP, approved_by = ? WHERE id = ?
    `;
    params = [status_validasi, nama_approver, id];
  } else {
    sql = `
      UPDATE validasi SET status_validasi = ?, approved_by = ? WHERE id = ?
    `;
    params = [status_validasi, nama_approver, id];
  }
  const [result] = await pool.query(sql, params);
  return result.affectedRows > 0;
};

module.exports = {
  createDataTable,
  createVendorTable,
  createValidasiTable,
  insertData,
  checkNopolExists,
  checkPAExists,
  insertPA,
  getDataByNopolAndPA,
  insertValidasi,
  updateValidasiStatus,
  getDataEntryById
};
