const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/set-registeration-pin', auth, authController.setLoginPin);
router.post('/set-transaction-pin', auth, authController.setTransactionPin);
// router.post('/create-pin', auth, authController.createPin);
router.post('/verifyotp', auth, authController.verifyOtp);

router.get("/get-user-info", auth, authController.getUser)

router.post('/reset-pin', authController.resetPin);
router.post('/login', authController.loginWithPin);
router.post("/verify-bvn", authController.kycBVN);
router.post("/sendotp", auth, authController.sendOtp);

router.get("/", (req, res) => {
    res.send('Swift Trust Auth API is running');
})


// router.post('/verify-selfie', auth, authController.verifySelfieWithPhotoId);
router.get('/get-user', auth, authController.getUser);

module.exports = router;