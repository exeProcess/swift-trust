const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, walletController.getWallet);
router.post('/fund', auth, walletController.initiateFunding);
router.post('/create-bankone-account', auth, walletController.createCustomer);
router.post('/update-Customer', auth, walletController.updateBankoneCustomer);
router.get('/get-Customer', auth, walletController.getBankoneCustomer);
router.post('/create-wallet', auth, walletController.createWallet);
router.get('/get-customer-account-details', auth, walletController.getBankoneAccountDetails);
router.post('/reverse-transfer', auth, walletController.reverseTransfer);

module.exports = router;