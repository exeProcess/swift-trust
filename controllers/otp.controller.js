const { User } = require('../models');
const otpService = require('../utils/otp');
const dojah = require('../utils/dojah')
const notifier = require('../utils/notifier');

exports.sendSMS = async (req, res) => {
  const user = req.user
  try {
    const { phone } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const sender_id = "Swift";
    const channel = "sms";
    const destination = phone;
    const message = `Your Swift-Trust MFB Authentication OTP code is: ${code}`;
    const payload = {
      sender_id,
      channel,
      message,
      destination
    };
    
    const smsResult = await dojah.sendOtp(payload); 
    if(smsResult.status === 400) {
      return res.status(500).json({ error: 'Failed to send OTP', details: smsResult.message });
    }else {
      user.otp = code;
      await user.save();
      return res.status(200).json({ message: 'OTP sent successfully', details: smsResult });
    }
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