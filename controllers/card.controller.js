const { Card } = require('../models');

exports.addCard = async (req, res) => {
  try {
    const { token, last4, expMonth, expYear, brand } = req.body;
    const card = await Card.create({
      token,
      last4,
      expMonth,
      expYear,
      brand,
      UserId: req.user.id
    });
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCards = async (req, res) => {
  try {
    const cards = await Card.findAll({ where: { UserId: req.user.id } });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};