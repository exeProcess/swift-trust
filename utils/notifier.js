const axios = require('axios');
const nodemailer = require('nodemailer');

const DOJAH_SMS_URL = 'https://api.dojah.io/api/v1/messaging/sms';
const DOJAH_APP_ID = process.env.DOJAH_APP_ID;
const DOJAH_API_KEY = process.env.DOJAH_API_KEY;

exports.sendSMS = async (phone, message) => {
  try {
    const payload = {
      to: phone,
      sms: message,
      channel: 'dnd'
    };
    await axios.post(DOJAH_SMS_URL, payload, {
      headers: {
        'AppId': DOJAH_APP_ID,
        'Authorization': `Bearer ${DOJAH_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('Failed to send SMS:', err.message);
  }
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

exports.sendEmail = async (to, subject, body) => {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text: body
    });
  } catch (err) {
    console.error('Failed to send email:', err.message);
  }
};