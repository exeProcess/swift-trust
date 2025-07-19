const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/set-pin', auth, authController.setPin);
router.post('/login', auth, authController.login);
router.post("/verify-bvn", authController.kycBVN)
router.get("/", (req, res) => {
    res.send('Swift Trust Auth API is running');
})
router.use(auth)
router.post('/verify-selfie', authController.verifySelfieWithPhotoId);
router.get('/get-user', auth, authController.getUser);

module.exports = router;