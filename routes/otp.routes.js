const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otp.controller');

router.post('/send', otpController.sendSMS);
router.post('/verify', otpController.verifyOtp);

module.exports = router;