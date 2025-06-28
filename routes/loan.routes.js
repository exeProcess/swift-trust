const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');

router.post('/apply', loanController.applyForLoan);
router.get('/:reference', loanController.getLoanInfo);
router.get('/', loanController.getMyLoans);
router.post('/repay', loanController.repayLoan);
router.post('/create', loanController.createLoan);

module.exports = router;
