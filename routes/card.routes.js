const express = require('express');
const router = express.Router();
const cardController = require('../controllers/card.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, cardController.addCard);
router.get('/', auth, cardController.getCards);

module.exports = router;
