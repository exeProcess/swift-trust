const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otp.controller');
const auth = require('../middleware/auth.middleware');

router.post('/sendotp', auth, otpController.verifyPhoneNumber);
router.post('/verifyotp', auth, otpController.verifyOtp);
router.post("/resendotp", auth, otpController.verifyPhoneNumber);

module.exports = router;