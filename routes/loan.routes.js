const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');
const auth = require('../middleware/auth.middleware');



router.post('/apply', auth, loanController.applyForLoan);
router.get('/:reference', auth, loanController.getLoanInfo);
router.get('/', auth, loanController.getMyLoans);
router.post('/repay',auth, loanController.repayLoan);
router.post('/create', auth, loanController.createLoan);
router.post('/create-standing-order', auth, loanController.createStandingOrder);
router.get('/get-standing-orders', loanController.getStandingOrderDetails);

module.exports = router;
