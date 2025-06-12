const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

router.post('/remita-payment', webhookController.handleRemitaWebhook);
router.post('/remita-withdrawal-status', webhookController.handleRemitaWithdrawalStatus);
router.post('/remita-card-status', webhookController.handleRemitaCardWebhook);


module.exports = router;