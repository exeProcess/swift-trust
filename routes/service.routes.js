const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.get('/get-vendors/:service', serviceController.getRemitaServiceVendors);
router.get('/get-vendor-products/:categoryCode/:provider', serviceController.gerRemitaVendorProducts);

module.exports = router;