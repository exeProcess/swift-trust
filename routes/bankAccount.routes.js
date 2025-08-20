const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankAccount.controller');
const auth = require('../middleware/auth.middleware');

router.post('/add', auth, bankController.addBankAccount);
router.post('/create-bank-one-customer', bankController.createBankOneCustomerAndAccount);
router.get('/mfbanks', auth, bankController.getMFBankAccounts);
router.get('/commercialbanks', auth, bankController.getCommercialBankAccounts);
router.post('/validate-account', auth, bankController.validateAccountNumber);
router.post('/update-account-tier', auth, bankController.updateAccountTier);
module.exports = router;
