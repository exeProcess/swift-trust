// utils/emailService.js
const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });
const transporter = nodemailer.createTransport({
    host: 'mail.swifttrustmfb.com',
    port: 465,
    secure: true, // true for port 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false // To prevent self-signed certificate errors
    }
});

exports.sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: 'Your Swift Trust MFB verification code',
    text: `Your verification code is ${code}. It will expire shortly.`,
  };

  return transporter.sendMail(mailOptions);
};
// const otpStore = new Map();

// exports.sendOTP = (phone) => {
//   const code = Math.floor(100000 + Math.random() * 900000).toString();
//   otpStore.set(phone, code);
//   console.log(`OTP sent to ${phone}: ${code}`); // Replace with actual SMS service
//   return code;
// };

// exports.verifyOTP = (phone, code) => {
//   const valid = otpStore.get(phone);
//   if (valid === code) {
//     otpStore.delete(phone);
//     return true;
//   }
//   return false;
// };
