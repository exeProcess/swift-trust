const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth.middleware');

router.get('/get-vendors/:service', serviceController.getRemitaServiceVendors);
router.get('/get-vendor-products/:categoryCode/:provider', serviceController.gerRemitaVendorProducts);
router.post('/buy-airtime', auth, serviceController.buyAirtime);

module.exports = router;