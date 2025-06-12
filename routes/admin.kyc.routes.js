const express = require('express');
const router = express.Router();
const adminKyc = require('../controllers/adminKyc.controller');
const adminAuth = require('../middleware/adminAuth.middleware');

router.get('/', adminAuth, adminKyc.listKycSubmissions);
router.post('/:id/approve', adminAuth, adminKyc.approveKyc);
router.post('/:id/reject', adminAuth, adminKyc.rejectKyc);

module.exports = router;
