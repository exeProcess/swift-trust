// const axios = require('axios');

// const DOJAH_API_KEY = process.env.DOJAH_API_KEY;
// const DOJAH_APP_ID = process.env.DOJAH_APP_ID;
// const headers = {
//   'Content-Type': 'application/json',
//   'AppId': DOJAH_APP_ID,
//   'Authorization': `Bearer ${DOJAH_API_KEY}`
// };

// exports.verifyBVN = async (bvn) => {

//   return axios.get('https://api.dojah.io/api/v1/kyc/bvn/advance', { bvn }, { headers });
// };

// exports.resolveBankAccount = async (account_number, bank_code) => {
//   return axios.post('https://api.dojah.io/api/v1/financial-institutions/resolve', { account_number, bank_code }, { headers });
// };

// exports.sendOtp = async (phone) => {
//   return axios.post('https://api.dojah.io/api/v1/messaging/otp', { phone_number: phone }, { headers });
// };

// exports.verifySelfieWithPhotoId = async (selfie_image, photoid_image, first_name, last_name) => {
//   const payload = { selfie_image, photoid_image };
//   if (first_name) payload.first_name = first_name;
//   if (last_name) payload.last_name = last_name;

//   return axios.post('https://api.dojah.io/api/v1/kyc/selfie-photoid', payload, { headers });
// }

// services/dojahService.js
const axios = require('axios');

const DOJAH_BASE_URL = process.env.DOJAH_BASE_URL;
const APP_ID = process.env.DOJAH_APP_ID;
const SECRET_KEY = process.env.DOJAH_API_KEY;


// POST /api/kyc/verify-bvn
// exports.AMLCheck = async (req, res) => {
//   const { first_name, middle_name, last_name, date_of_birth } = req.body;
//   if (!first_name || !last_name || !date_of_birth) {
//     return res.status(400).json({ error: 'First name, last name, and date of birth are required' });
//   }

//   try {
//     const response = await axios.post(
//       `${DOJAH_BASE_URL}/api/v1/aml/screening`,
//       { first_name, middle_name, last_name, date_of_birth },
//       { headers }
//     );

//     const result = response.data;

//     res.status(200).json({
//       message: 'AML check successfully completed',
//       data: result
//     });
//   } catch (error) {
//     console.error('❌ AML check error:', error.response?.data || error.message);

//     res.status(500).json({
//       error: 'Failed to process AML check',
//       details: error.response?.data || error.message
//     });
//   }
// };


exports.AMLCheck = async (data) => {
  
    if (!data.first_name || !data.last_name || !data.date_of_birth) {
      return res.status(400).json({ error: 'First name, last name, and date of birth are required' });
    }
    const first_name = data.first_name;
    const middle_name = data.middle_name;
    const last_name = data.last_name;
    const date_of_birth = data.date_of_birth; 
    try {
      const response = await axios.post(
        `${DOJAH_BASE_URL}/api/v1/aml/screening`,
        { first_name, middle_name, last_name, date_of_birth },
        { headers }
      );

      const result = response.data;

      res.status(200).json({
        message: 'AML check successfully completed',
        data: result
      });
    } catch (error) {
      console.error('❌ AML check error:', error.response?.data || error.message);

      res.status(500).json({
        error: 'Failed to process AML check',
        details: error.response?.data || error.message
      });
    }
  };

exports.kycBVN = async (bvn) => {
  
    if (!bvn) {
      return { error: 'BVN is required as a query parameter' };
    }
  
    try {
      // const url = `${DOJAH_BASE_URL}/api/v1/kyc/bvn/full`;
      // const response = await axios.get(url, { headers,  params: {bvn } });
  
      const response = await axios.get('https://api.dojah.io/api/v1/kyc/bvn/full', {
        params: { bvn }, // Pass the BVN as a query param
        headers: {
          'AppId': APP_ID,
          'Authorization': SECRET_KEY
        }
      });
      return {
        message: 'BVN verification successful',
        data: response.data
      };
    } catch (error) {
  
      return {
        error: 'Failed to verify BVN',
        details: error.response?.data || error.message
      };
    }
  };

// Example: Verify NIN
exports.verifyNIN = async (nin) => {

  
  if (!nin) {
    return { error: 'NIN is required as a query parameter' };
  }

  try {

    const response = await axios.get('https://api.dojah.io/api/v1/kyc/nin', {
      params: { nin }, // Pass the NIN as a query param
      headers: {
        'AppId': APP_ID,
        'Authorization': SECRET_KEY
      }
    });
    return {
      message: 'NIN verification successful',
      data: response.data
    };
  } catch (error) {

    return {
      error: 'Failed to verify NIN',
      details: error.response?.data || error.message
    };
  }
};


