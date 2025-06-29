const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const loanController = require('../controllers/loan.controller');



router.post('/apply', auth, loanController.applyForLoan);
router.get('/:reference', auth, loanController.getLoanInfo);
router.get('/', auth, loanController.getMyLoans);
router.post('/repay',auth, loanController.repayLoan);
router.post('/create', auth, loanController.createLoan);
router.post('/create-standing-order', auth, loanController.createStandingOrder);
router.get('/get-standing-orders', loanController.getStandingOrders);

module.exports = router;
