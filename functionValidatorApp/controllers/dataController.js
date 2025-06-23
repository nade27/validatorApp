const { insertData, checkNopolExists, getDataByNopolAndPA, insertValidasi, updateValidasiStatus, getDataEntryById } = require('../models/dataModel');

const insertDataEntry = async (req, res) => {
  try {
    const { nopol, nokir, sopir, PA, jenistruk, pbox, lbox, tbox, volbox, tonase } = req.body;

    if (!nopol || !nokir || !sopir || !PA || !jenistruk || pbox == null || lbox == null || tbox == null || volbox == null || tonase == null) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exists = await checkNopolExists(nopol);
    if (exists) {
      return res.status(400).json({ message: 'Data with this nopol already exists, cannot insert duplicate.' });
    }

    // PA handling is done inside insertData now
    const insertId = await insertData({ nopol, nokir, sopir, PA, jenistruk, pbox, lbox, tbox, volbox, tonase });
    res.status(201).json({ message: 'Data inserted successfully', id: insertId });
  } catch (error) {
    console.error('Insert data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDataEntryByNopolAndPA = async (req, res) => {
  try {
    const { nopol, PA } = req.body;

    if (!nopol || !PA) {
      return res.status(400).json({ message: 'nopol and PA are required' });
    }

    const data = await getDataByNopolAndPA(nopol, PA);
    if (data.length === 0) {
      return res.status(400).json({ message: 'Data tidak valid' });
    }

    res.status(200).json({ data });
  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const fs = require('fs');
const path = require('path');

const postValidasi = async (req, res) => {
  try {
    const { id_data_entries } = req.body;

    if (!req.user) {
      console.error('Authenticated user info missing:', req.user);
      return res.status(400).json({ message: 'Authenticated user information is missing' });
    }

    if (!req.user.nama) {
      console.error('Authenticated user name missing:', req.user);
      return res.status(400).json({ message: 'Authenticated user name is missing in token' });
    }

    if (!req.user.NIP) {
      console.error('Authenticated user NIP missing:', req.user);
      return res.status(400).json({ message: 'Authenticated user NIP is missing in token' });
    }

    const nama_users = req.user.nama;
    const nip_users = req.user.NIP;

    if (!id_data_entries) {
      return res.status(400).json({ message: 'id_data_entries is required' });
    }

    // Get nopol, PA, sopir for naming files
    const dataEntry = await getDataEntryById(id_data_entries);
    if (!dataEntry) {
      return res.status(400).json({ message: 'Data entry not found for given id_data_entries' });
    }
    const { nopol, PA, sopir } = dataEntry;

    // Handle uploaded files and rename them
    let stnk_pic_path = null;
    let card_pic_path = null;

    if (req.files['stnk_pic'] && req.files['stnk_pic'][0]) {
      const file = req.files['stnk_pic'][0];
      const ext = path.extname(file.originalname);
      const newFileName = `${nopol}_${PA}_STNK${ext}`;
      const newPath = path.join(path.dirname(file.path), newFileName);
      fs.renameSync(file.path, newPath);
      stnk_pic_path = `uploads/${newFileName}`;
    }

    if (req.files['card_pic'] && req.files['card_pic'][0]) {
      const file = req.files['card_pic'][0];
      const ext = path.extname(file.originalname);
      const newFileName = `${sopir}_${PA}_IDCARD${ext}`;
      const newPath = path.join(path.dirname(file.path), newFileName);
      fs.renameSync(file.path, newPath);
      card_pic_path = `uploads/${newFileName}`;
    }

    const insertId = await insertValidasi({ id_data_entries, nama_users, nip_users, stnk_pic: stnk_pic_path, card_pic: card_pic_path });
    res.status(201).json({ message: 'Validasi data posted successfully', id: insertId });
  } catch (error) {
    console.error('Post validasi error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveValidasi = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      console.error('Authenticated user info missing:', req.user);
      return res.status(400).json({ message: 'Authenticated user information is missing' });
    }

    if (!req.user.nama) {
      console.error('Authenticated user name missing:', req.user);
      return res.status(400).json({ message: 'Authenticated user name is missing in token' });
    }


    const nama_approver = req.user.nama;

    const updated = await updateValidasiStatus(id, 'Approved', nama_approver);
    if (!updated) {
      return res.status(404).json({ message: 'Validasi data not found' });
    }

    res.status(200).json({ message: 'Validasi approved successfully' });
  } catch (error) {
    console.error('Approve validasi error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getValidasiRecords = async (req, res) => {
  try {
    const sql = `
      SELECT v.id, v.id_data_entries, v.nama_users, v.nip_users, v.status_validasi, v.stnk_pic, v.card_pic, v.create_timestamp, v.approval_timestamp,
             d.nopol, d.nokir, d.sopir, d.PA, d.jenistruk, d.pbox, d.lbox, d.tbox, d.volbox, d.tonase, v.approved_by
      FROM validasi v
      JOIN data_entries d ON v.id_data_entries = d.id
      ORDER BY v.create_timestamp DESC
    `;
    const [rows] = await require('../config/db').query(sql);
    res.status(200).json({ data: rows });
  } catch (error) {
    console.error('Get validasi records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  insertDataEntry,
  getDataEntryByNopolAndPA,
  postValidasi,
  approveValidasi,
  getValidasiRecords
};
