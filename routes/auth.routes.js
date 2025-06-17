const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/set-pin', auth, authController.setPin);

router.use(auth)
router.post('/verify-selfie', authController.verifySelfieWithPhotoId);

module.exports = router;