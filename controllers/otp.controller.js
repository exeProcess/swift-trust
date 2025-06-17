const { User } = require('../models');
const otpService = require('../utils/otp');
const notifier = require('../utils/notifier');

exports.sendSMS = async (req, res) => {
  try {
    const { phone } = req.body;
    const code = await notifier.sendSMS(phone, 'Your Swift-Trust Authentication OTP code is: 123456'); 
    if(code.status === 'error') {
      return res.status(500).json({ error: 'Failed to send OTP', details: code.message });
    }else {
      return res.status(200).json({ message: 'OTP sent successfully', code: code.sms_status });
    }
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