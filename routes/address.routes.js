const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const auth = require('../middleware/auth.middleware');

router.post('/submit', auth, addressController.submitAddress);

module.exports = router;