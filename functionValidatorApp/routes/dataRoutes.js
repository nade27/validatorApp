const express = require('express');
const router = express.Router();
const multer = require('multer');
const { insertDataEntry, getDataEntryByNopolAndPA, postValidasi, approveValidasi, getValidasiRecords, getDataEntryById } = require('../controllers/dataController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // You may want to create this folder or configure as needed
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post('/insert', authenticateToken, authorizeRoles('Admin', 'Supervisor'), insertDataEntry);
router.post('/ceknopolPA', authenticateToken, getDataEntryByNopolAndPA);
router.post('/validasi', authenticateToken, upload.fields([{ name: 'stnk_pic', maxCount: 1 }, { name: 'card_pic', maxCount: 1 }]), postValidasi);
router.put('/validasi/:id/approve', authenticateToken, authorizeRoles('Admin', 'Supervisor'), approveValidasi);
router.get('/validasi', authenticateToken, getValidasiRecords);

module.exports = router;
