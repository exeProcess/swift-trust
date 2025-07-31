const axios = require('axios');
const crypto = require('crypto');

const REMITA_API_KEY = process.env.REMITA_API_KEY;
const REMITA_API_SECRET = process.env.REMITA_API_SECRET;
const REMITA_BASE_URL = process.env.REMITA_BASE_URL;

exports.sendToBank = async ({ amount, accountNumber, bankCode, reference }) => {
  const payload = {
    amount,
    currency: 'NGN',
    account_number: accountNumber,
    bank_code: bankCode,
    narration: 'Swift Trust Payout',
    reference
  };

  const hash = crypto.createHmac('sha512', REMITA_API_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  const response = await axios.post(`${REMITA_BASE_URL}/disbursements/single`, payload, {
    headers: {
      'Authorization': `Bearer ${REMITA_API_KEY}`,
      'Signature': hash,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
};


exports.initiatePayment = async (userId, amount, email, reference) => {
  const response = await axios.post(`${REMITA_BASE_URL}/payment/initiate`, {
    amount,
    userId,
    email,
    reference
  }, {
    headers: {
      Authorization: `Bearer ${REMITA_API_KEY}`
    }
  });
  return response.data;
};

exports.verifyWebhookSignature = (req) => {
  const signature = req.headers['x-remita-signature'];
  const payload = JSON.stringify(req.body);
  const hash = crypto.createHmac('sha256', REMITA_SECRET).update(payload).digest('hex');
  return signature === hash;
};

exports.payUtilityBill = async ({ type, target, amount, reference }) => {
  // Replace with actual Remita API call
  const payload = {
    service_type: type,
    customer_id: target,
    amount,
    currency: 'NGN',
    reference,
    narration: `Bill payment to ${type}`
  };

  const hash = crypto.createHmac('sha512', REMITA_API_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  const response = await axios.post(`${REMITA_BASE_URL}/bills/pay`, payload, {
    headers: {
      'Authorization': `Bearer ${REMITA_API_KEY}`,
      'Signature': hash,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
};

exports.verifyServiceTarget = async ({ type, target }) => {
  const payload = { service_type: type, customer_id: target };
  const hash = crypto.createHmac('sha512', REMITA_API_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  const response = await axios.post(`${REMITA_BASE_URL}/bills/verify`, payload, {
    headers: {
      'Authorization': `Bearer ${REMITA_API_KEY}`,
      'Signature': hash,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

exports.initiatePayment = async ({ amount, description, reference, user }) => {
  const payload = {
    amount,
    currency: 'NGN',
    customer: {
      name: user.name,
      email: user.email,
      phone: user.phone
    },
    description,
    reference,
    redirect_url: `${process.env.FRONTEND_URL}/payment/callback` // optional
  };

  const hash = crypto.createHmac('sha512', REMITA_API_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  const response = await axios.post(`${REMITA_BASE_URL}/payments/initiate`, payload, {
    headers: {
      'Authorization': `Bearer ${REMITA_API_KEY}`,
      'Signature': hash,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
};



  

  const generateHash = ({ merchantId, serviceTypeId, requestId, amount }) => {
  const concatenated = merchantId + serviceTypeId + requestId + amount + process.env.REMITA_API_SECRET_KEY;
  return crypto.createHash('sha512').update(concatenated).digest('hex');
};

exports.createDirectDebitMandate = async (payload) => {
  const {
    payerName,
    payerEmail,
    payerPhone,
    payerBankCode,
    payerAccount,
    amount,
    startDate,
    endDate,
    frequency
  } = payload;

  const requestId = `REQ${Date.now()}`;
  const hash = generateHash({
    merchantId: process.env.REMITA_MERCHANT_ID,
    serviceTypeId: '35126630',
    requestId,
    amount
  });

  const body = {
    merchantId: process.env.REMITA_MERCHANT_ID,
    serviceTypeId: '35126630',
    hash,
    payerName,
    payerEmail,
    payerPhone,
    payerBankCode,
    payerAccount,
    requestId,
    amount,
    startDate,
    endDate,
    mandateType: 'SO',
    frequency
  };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `remitaConsumerKey=${process.env.REMITA_API_PUBLIC_KEY}, remitaConsumerToken=${hash}`
  };

  try {
    const res = await axios.post(`${process.env.REMITA_BASE_URL}/remita/exapp/api/v1/directdebit/mandate`, body, { headers });
    return res.data;
  } catch (error) {
    console.error('Remita Error:', error.response?.data || error.message);
    throw error;
  }
};

const electricity = 1;
const airtime = 2;
const data = 3;
const cablesub = 4;


const airtimeAndDataproviderCodes = {
  MTN: "mtn_ng",
  GLO: "glo_ng",
  AIRTEL: "airtel_ng",
  ETISALAT: "9mobile_ng"
}

const cableTvProviderCodes = {
  DSTV: "dstv_ng",
  GOTV: "gotv_ng",
  STARTIMES: "startimes_ng"
}

const electricityProviderCodes = {
  EKEDC: "ekedc_ng",
  IKEDC: "ikedc_ng",
  AEDC: "aedc_ng",
  PHEDC: "phedc_ng",
  IBEDC: "ibedc_ng"
}

const billerCategory = {
  electricity,
  airtime,
  internet_data_subscription,
  cable_tv
}

// const getElectricityProviders = async () => {
//   const baseUrl = 'https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/vending/providers/category/1';
//   const secretKey = process.env.REMITA_SECRET_KEY; // Store your test/live secret key in .env

//   try {
//     const response = await axios.get(baseUrl, {
//       headers: {
//         'secretKey': secretKey
//       }
//     });

//     return response.data;
//   } catch (error) {
//     throw error.response ? error.response.data : error;
//   }
// };

// exports.getAirtimeProviders = async () => {
//   const baseUrl = 'https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/vending/providers/category/2';
//   const secretKey = process.env.REMITA_SECRET_KEY;

//   try {
//     const response = await axios.get(baseUrl, {
//       headers: {
//         'secretKey': secretKey
//       }
//     });

//     return response.data;
//   } catch (error) {
//     throw error.response ? error.response.data : error;
//   }
// };

// exports.getCableTvProviders = async () => {
//   const baseUrl = 'https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/vending/providers/category/4';
//   const secretKey = process.env.REMITA_SECRET_KEY;

//   try {
//     const response = await axios.get(baseUrl, {
//       headers: {
//         'secretKey': secretKey
//       }
//     });

//     return response.data;
//   } catch (error) {
//     throw error.response ? error.response.data : error;
//   }
// }

// exports.getDataProviders = async () => {
//   const baseUrl = 'https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/vending/providers/category/3';
//   const secretKey = process.env.REMITA_SECRET_KEY;

//   try {
//     const response = await axios.get(baseUrl, {
//       headers: {
//         'secretKey': secretKey
//       }
//     });

//     return response.data;
//   } catch (error) {
//     throw error.response ? error.response.data : error;
//   }
// };

// exports.getBillerCategories = async () => {
//   const url = 'https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/vending/categories?page=0&size=20';
//   const secretKey = process.env.REMITA_SECRET_KEY;

//   try {
//     const response = await axios.get(url, {
//       headers: {
//         'secretKey': secretKey
//       }
//     });

//     return response.data;
//   } catch (error) {
//     throw error.response ? error.response.data : error;
//   }
// };

exports.buyAirtime = async (payload) => {

}

exports.getproduct = async (categoryCode, provider) => {
  const url = `${BASE_URL}/products?page=0&pageSize=20&countryCode=NGA&categoryCode=${categoryCode}&provider=${provider}`;
  const secretKey = process.env.REMITA_SECRET_KEY;

  try {
    const response = await axios.get(url, {
      headers: {
        secretKey,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Remita vending products:', error.message);
    throw new Error('Unable to retrieve vending products from Remita');
  }

}

// exports.payUtilityBill

exports.buyCableTVSubscription = async (payload) => {
 
}