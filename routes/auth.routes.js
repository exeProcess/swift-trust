const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/create-pin', auth, authController.createPin);
router.post('/reset-pin', authController.resetPin);
router.post('/login', auth, authController.loginUser);
router.post("/verify-bvn", authController.kycBVN)

router.get("/", (req, res) => {
    res.send('Swift Trust Auth API is running');
})


router.post('/verify-selfie', auth, authController.verifySelfieWithPhotoId);
router.get('/get-user', auth, authController.getUser);

module.exports = router;