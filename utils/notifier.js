const axios = require('axios');
const nodemailer = require('nodemailer');

const DOJAH_SMS_URL = 'https://api.dojah.io/api/v1/messaging/sms';
const DOJAH_SMS_STATUS_URL = 'https://api.dojah.io/api/v1/messaging/get_status';
const DOJAH_APP_ID = process.env.DOJAH_APP_ID;
const DOJAH_API_KEY = process.env.DOJAH_API_KEY;

exports.sendSMS = async (phone, message) => {
  try {
    const payload = {
      to: phone,
      sms: message,
      channel: 'sms'
    };
    const response = await axios.post(DOJAH_SMS_URL, payload, {
      headers: {
        'AppId': DOJAH_APP_ID,
        'Authorization': `Bearer ${DOJAH_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.entity.message_id) {
      const statusResponse = await getSmsStatus(response.data.message_id);
      if (statusResponse.status === 'error') {
        return { status: 'error', message: statusResponse.message };
      } else {
        return { status: 'success', message_id: response.data.message_id, sms_status: statusResponse.status };
      }
    } 
  } catch (err) {
    console.error('Failed to send SMS:', err.message);
  }
};

const getSmsStatus = async (message_id) => {
  try {
    const response = await axios.get(`${DOJAH_SMS_STATUS_URL}`, {
      params: { message_id },
      headers: {
        'AppId': DOJAH_APP_ID,
        'Authorization': `Bearer ${DOJAH_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.entity;
  } catch (err) {
    return { status: 'error', message: err.message};
  }
}

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