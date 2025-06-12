const { User, Pin } = require('../models');
const jwt = require('../utils/jwt');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const { phone, bvn } = req.body;
    const user = await User.create({ phone, bvn });
    const token = jwt.generateToken(user);
    res.status(201).json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.setPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const hashed = await bcrypt.hash(pin, 10);
    const saved = await Pin.create({ hashedPin: hashed, UserId: req.user.id });
    res.status(201).json({ message: 'PIN created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};