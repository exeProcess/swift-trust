const { Wallet, Transaction, PaymentIntent } = require('../models');
const remita = require('../utils/remita');
const { v4: uuidv4 } = require('uuid');

exports.getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ where: { UserId: req.user.id } });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.initiateFunding = async (req, res) => {
  try {
    const { amount } = req.body;
    const reference = uuidv4();
    await PaymentIntent.create({ reference, amount, UserId: req.user.id });
    const payment = await remita.initiatePayment(req.user.id, amount, req.user.email, reference);
    res.json({ message: 'Payment initiated', reference, payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};