const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otp.controller');
const auth = require('../middleware/auth.middleware');

router.post('/send', auth, otpController.sendSMS);
router.post('/verify', auth, otpController.verifyOtp);

module.exports = router;