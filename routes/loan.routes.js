const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');
const auth = require('../middleware/auth.middleware');


router.use(auth);
router.post('/apply', loanController.applyForLoan);
router.get('/:reference', loanController.getLoanInfo);
router.get('/', loanController.getMyLoans);
router.post('/repay', loanController.repayLoan);
router.post('/create', loanController.createLoan);
router.post('/create-standing-order', loanController.createStandingOrder);
router.get('/get-standing-orders', loanController.getStandingOrderDetails);

module.exports = router;
