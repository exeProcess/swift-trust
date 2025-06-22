const axios = require('axios');

const DOJAH_API_KEY = process.env.DOJAH_API_KEY;
const DOJAH_APP_ID = process.env.DOJAH_APP_ID;
const headers = {
  'Content-Type': 'application/json',
  'AppId': DOJAH_APP_ID,
  'Authorization': `Bearer ${DOJAH_API_KEY}`
};

exports.verifyBVN = async (bvn) => {
  console.log('🔑 DOJAH_SECRET_KEY:', process.env.DOJAH_SECRET_KEY);

  return axios.get('https://api.dojah.io/api/v1/kyc/bvn/advance', { bvn }, { headers });
};

exports.resolveBankAccount = async (account_number, bank_code) => {
  return axios.post('https://api.dojah.io/api/v1/financial-institutions/resolve', { account_number, bank_code }, { headers });
};

exports.sendOtp = async (phone) => {
  return axios.post('https://api.dojah.io/api/v1/messaging/otp', { phone_number: phone }, { headers });
};

exports.verifySelfieWithPhotoId = async (selfie_image, photoid_image, first_name, last_name) => {
  const payload = { selfie_image, photoid_image };
  if (first_name) payload.first_name = first_name;
  if (last_name) payload.last_name = last_name;

  return axios.post('https://api.dojah.io/api/v1/kyc/selfie-photoid', payload, { headers });
}