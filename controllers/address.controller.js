const { Address } = require('../models');

exports.submitAddress = async (req, res) => {
  try {
    const { addressLine, city, state, proofDocUrl } = req.body;
    const address = await Address.create({ addressLine, city, state, proofDocUrl, UserId: req.user.id });
    res.status(201).json(address);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};