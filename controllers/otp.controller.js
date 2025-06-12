const { User } = require('../models');
const otpService = require('../utils/otp');

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const code = otpService.sendOTP(phone);
    res.status(200).json({ message: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, code } = req.body;
    const isValid = otpService.verifyOTP(phone, code);
    if (!isValid) return res.status(400).json({ error: 'Invalid OTP' });

    const user = await User.findOne({ where: { phone } });
    if (user) {
      user.isPhoneVerified = true;
      await user.save();
    }

    res.json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};