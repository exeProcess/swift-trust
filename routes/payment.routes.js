const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const auth = require('../middleware/auth.middleware');

router.post('/:reference/retry', auth, paymentController.retryPayment);

module.exports = router;