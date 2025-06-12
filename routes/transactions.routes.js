const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, transactionController.getTransactions);
router.post('/transfer', auth, transactionController.transferFunds);
router.get('/:id', auth, transactionController.getTransactionById);
router.get('/filter/', auth, transactionController.getFilteredTransactions);


module.exports = router;