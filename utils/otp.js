const otpStore = new Map();

exports.sendOTP = (phone) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, code);
  console.log(`OTP sent to ${phone}: ${code}`); // Replace with actual SMS service
  return code;
};

exports.verifyOTP = (phone, code) => {
  const valid = otpStore.get(phone);
  if (valid === code) {
    otpStore.delete(phone);
    return true;
  }
  return false;
};
