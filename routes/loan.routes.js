const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

router.post('/apply', loanController.applyForLoan);
router.get('/:reference', loanController.getLoanInfo);
router.get('/', loanController.getMyLoans);
router.post('/repay', loanController.repayLoan);

module.exports = router;
