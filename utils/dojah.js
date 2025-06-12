const axios = require('axios');

const DOJAH_API_KEY = process.env.DOJAH_API_KEY;
const DOJAH_APP_ID = process.env.DOJAH_APP_ID;
const headers = {
  'Content-Type': 'application/json',
  'AppId': DOJAH_APP_ID,
  'Authorization': `Bearer ${DOJAH_API_KEY}`
};

exports.verifyBVN = async (bvn) => {
  return axios.post('https://api.dojah.io/api/v1/kyc/bvn', { bvn }, { headers });
};

exports.resolveBankAccount = async (account_number, bank_code) => {
  return axios.post('https://api.dojah.io/api/v1/financial-institutions/resolve', { account_number, bank_code }, { headers });
};

exports.sendOtp = async (phone) => {
  return axios.post('https://api.dojah.io/api/v1/messaging/otp', { phone_number: phone }, { headers });
};