const express = require('express');
const router = express.Router();
const bvnController = require('../controllers/bvn.controller');
const auth = require('../middleware/auth.middleware');

router.post('/verify', auth, bvnController.verifyBVN);
module.exports = router;