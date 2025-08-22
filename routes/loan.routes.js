const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const loanController = require('../controllers/loan.controller');



router.get("/get-eligible-amount", auth, loanController.eligibleAmount);

module.exports = router;
