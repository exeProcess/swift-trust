const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth.middleware');

router.get('/get-vendors/:service', serviceController.getRemitaServiceVendors);
router.get('/get-vendor-products/:categoryCode/:providerCode', serviceController.gerRemitaVendorProducts);
router.post('/buy-airtime', serviceController.buyAirtimeOrData);
router.post('/buy-data', serviceController.buyAirtimeOrData); 
module.exports = router;