const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');
const auth = require('../middleware/auth.middleware');

router.post('/apply', auth, loanController.applyLoan);
router.get('/status', auth, loanController.getLoans);
router.post('/approve', auth, loanController.approveLoan);
router.post('/disburse', auth, loanController.disburseLoan);
router.post('/repay', auth, loanController.repayLoan);
router.post('/:loanId/repay', auth, loanController.repayLoan);
router.post('/:loanId/repay/card', auth, loanController.initiateCardRepayment);

module.exports = router;