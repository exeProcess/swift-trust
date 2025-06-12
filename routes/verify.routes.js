const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verify.controller');
const auth = require('../middleware/auth.middleware');

router.get('/dstv/:smartcard', auth, verifyController.verifyDSTV);
router.get('/gotv/:smartcard', auth, verifyController.verifyGoTV);
router.get('/electricity/:meter', auth, verifyController.verifyElectricity);
router.get('/smile/:customerId', auth, verifyController.verifySmile);
router.get('/spectranet/:customerId', auth, verifyController.verifySpectranet);

module.exports = router;