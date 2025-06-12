const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc.controller');
const auth = require('../middleware/auth.middleware');

router.post('/submit', auth, kycController.submitKYC);
router.get('/status', auth, kycController.getKYCStatus);

module.exports = router;