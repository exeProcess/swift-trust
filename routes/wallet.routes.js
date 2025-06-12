const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, walletController.getWallet);
router.post('/fund', auth, walletController.initiateFunding);

module.exports = router;