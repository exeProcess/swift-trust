// const axios = require('axios');
// services/dojahService.js
const sharp = require('sharp');
const axios = require('axios');

const DOJAH_BASE_URL = process.env.DOJAH_BASE_URL;
const APP_ID = process.env.DOJAH_APP_ID || '682aeea9d60ba3c1b823db4f';
const SECRET_KEY = process.env.DOJAH_API_KEY || 'prod_sk_nLczkaXORcuMuus8M5YSY9a5Z';

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

exports.sendOtp = async (data) => {
  const { sender_id, destination, channel, expiry, } = data;
  try {
    return axios.post('https://api.dojah.io/api/v1/messaging/otp', { phone_number: phone }, { headers });
  } catch (error) {
    
  }
};

exports.registerSenderId = async () => {
  try {
    const senderId = await axios.post('https://api.dojah.io/api/v1/messaging/sender_id', 
      { sender_id: "Swift" }, 
      {
        headers: {
          "AppId": APP_ID,
          'Authorization': SECRET_KEY,
        }
      }
    );

    if(!senderId.data.enity.message){
      return {
        error: "Failed to register SMS sender ID"
      }
    }
    const mess = senderId?.data.enity.message
    console.log(mess);
    return {
      status: 201,
      message: mess
    }
  } catch (error) {
    console.log(error.response?.data || error.message);
    return { status: 500, error: error.response?.data || error.message };
  }
}

exports.verifySelfieWithPhotoId = async (payload) => {
  const { selfie_image, photoid_image, first_name, last_name } = payload;
  

  try {
    const compressedSelfie = await compressBase64Image(selfie_image);
    const compressedPhotoId = await compressBase64Image(photoid_image);
    const response = await axios.post(
      'https://api.dojah.io/api/v1/kyc/photoid/verify',
      {
        selfie_image: compressedSelfie,
        photoid_image: compressedPhotoId,
        first_name: first_name,
        last_name: last_name
      },
      {
        headers: {
          "AppId": APP_ID,
          'Authorization': SECRET_KEY,
        }
      }
    );

    // console.log('✅ Selfie Verification Response:');
    // console.log(response.data);
    return response.data;

  } catch (error) {
    return { error: error.response?.data || error.message };
  }

  
}


const compressBase64Image = async (base64String, maxWidth = 500, quality = 60) =>{
  const buffer = Buffer.from(base64String, 'base64');

  const compressedBuffer = await sharp(buffer)
    .resize({ width: maxWidth, withoutEnlargement: true }) // prevent upscaling
    .jpeg({ quality }) // compress
    .toBuffer();

  return compressedBuffer.toString('base64');
}



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

  exports.kycBVNAdvance = async (bvn) => {
    try {
      const response = await axios.get('https://api.dojah.io/api/v1/kyc/bvn/advance', {
        params: {
          bvn: bvn,
        },
        headers: {
          "AppId": APP_ID,
          'Authorization': SECRET_KEY,
        },
      });

      // console.log('✅ BVN Verification Response:');
      // console.log(response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Error verifying BVN:', error.response?.data || error.message);
      return { error: error.response?.data || error.message };
    }
} ;

exports.kycBVNFull = async (bvn) => {
  
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
      return response.data;
    } catch (error) {
      return { error: error.response?.data || error.message };
    }
  };

  exports.checkCreditScore = async (bvn) => {
  
    if (!bvn) {
      return { error: 'BVN is required as a query parameter' };
    }
    try {
      const response = await axios.get('https://api.dojah.io/api/v1/credit_bureau', {
        params: { bvn }, // Pass the BVN as a query param
        headers: {
          'AppId': APP_ID,
          'Authorization': SECRET_KEY
        }
      });
      return {
        message: 'Credit score check successful',
        data: response.data
      };
    } catch (error) {
      return {
        error: 'Failed to check credit score',
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


