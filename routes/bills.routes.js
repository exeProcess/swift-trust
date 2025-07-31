const express = require('express');
const router = express.Router();
const billsController = require('../controllers/bills.controller');
const auth = require('../middleware/auth.middleware');

router.post('/pay', auth, billsController.payBill);
router.get('/', auth, billsController.getBillPayments);
router.post('/airtime', auth, billsController.buyAirtime);
router.post('/electricity', auth, billsController.payElectricity);
router.post('/dstv', auth, billsController.payDSTV);
router.post('/gotv', auth, billsController.payGoTV);
router.post('/startimes', auth, billsController.payStartimes);
router.post('/spectranet', auth, billsController.paySpectranet);
router.post('/smile', auth, billsController.paySmile);

router.get('/vending-products', auth, getVendingProducts);

module.exports = router;