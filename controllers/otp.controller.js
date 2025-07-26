const { User } = require('../models');
const otpService = require('../utils/otp');
const dojah = require('../utils/dojah')
const notifier = require('../utils/notifier');
const bankOne = require("../utils/bankOne");

exports.verifyPhoneNumber = async (req, res) => {
  const user = req.user
  try {
    const { phone, channel} = req.body;
    const sender_id = "Swift";
    const destination = phone;
    const payload = {
      sender_id,
      channel,
      destination
    };
    
    const otpResult = await dojah.sendOtp(payload); 
    if(smsResult.status === 400) {
      return res.status(500).json({ error: 'Failed to send OTP', details: otpResult.message });
    }else {
      user.otp = otpResult.entity.reference_id;
      await user.save();
      return res.status(200).json({ message: 'OTP sent successfully', details: otpResult });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const userId = req.user.id;

  
  try {
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const reference_id = user.otp;
    const { code } = req.body;
    const isValid = dojah.verifyOTP(code, reference_id);
    if (!isValid) return res.status(400).json({ error: 'Invalid OTP' });

    if (user) {
      user.isPhoneVerified = true;
      await user.save();
    }
    
    res.json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};