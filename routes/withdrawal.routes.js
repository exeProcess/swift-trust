const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawal.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, withdrawalController.initiateWithdrawal);
router.get('/', auth, withdrawalController.getWithdrawals);
router.post('/send-bank', auth, withdrawalController.withdrawToBankManual);
router.post('/:id/retry', auth, withdrawalController.retryFailedWithdrawal);

module.exports = router;