const { Address } = require('../models');

exports.submitAddress = async (req, res) => {
  try {
    const { addressNumber, city, state, country, proofOfAdress } = req.body;
    const address = await Address.create({ addressNumber, city, state, country, proofOfAdress, userId: req.user.id });
    res.status(201).json({status: 200, message: "User address addedd successfully"});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};