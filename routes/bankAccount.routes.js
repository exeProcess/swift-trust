const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankAccount.controller');
const auth = require('../middleware/auth.middleware');

router.post('/add', auth, bankController.addBankAccount);

module.exports = router;
