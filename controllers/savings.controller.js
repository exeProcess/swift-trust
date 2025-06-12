const otpService = require('../utils/otp');
const dojah = require('../utils/dojah');

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    await dojah.sendOtp(phone); // Replaces mocked console OTP
    otpService.sendOTP(phone); // Store in-memory for now
    res.status(200).json({ message: 'OTP sent via Dojah' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};