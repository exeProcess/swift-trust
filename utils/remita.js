const axios = require('axios');
const crypto = require('crypto');

// const REMITA_API_KEY = process.env.REMITA_API_KEY;
const REMITA_API_SECRET = process.env.REMITA_API_SECRET_KEY || 'remi_test_sk_YVZ6OXpRcHdmaitoOUU3TGZya1Fob2IxZSt1bUxMdnV3ZlZtb1E9PTdlM2M0ZjYyYzc2MzQ0YzA2YTFlODFhYWE2MmI5MzU2NzQ4NWY0OTY3ZDM1YmEzOWMzOTczZDk1YzU5NjE3NWM=';
const REMITA_API_KEY = process.env.REMITA_API_PUBLIC_KEY || 'pk_test_B+y9/BpYxgzS0OO5rB0ldHvDDpC/rDvfLEpu+Xn5AK5J+tFa57Sw4nYgE/Ht/5lx'; 
// const REMITA_BASE_URL = process.env.REMITA_BASE_URL;

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

const telcoProviderCodes = {
  'mtn': "mtn_ng",
  'airtel': "airtel_ng",
  'glo': "glo_ng",
  '9mobile': "9mobile_ng"
};

const vendingCategoryTypes = {
  'airtime': 'airtime',
  'data': 'internet_data_subscription',
  'cable tv': 'cable_tv',
  'electricity': 'electricity',
}

exports.getVendingProducts = async (payload) => {
  const { providerCode } = payload;
  const categoryCode = payload.category;
  // const providerCode = telcoProviderCodes[provider.toLowerCase()];
  let provider;
  switch (providerCode) {
    case "mtn":
      provider = "mtn_ng";
      break;
    case "airtel":
      provider = "airtel_ng";
      break;
    case "glo":
      provider = "glo_ng";
      break;
    case "9mobile":
      provider = "9mobile_ng";
      break
    default:
      throw("Invalid provider");
  }

  try{
    const getVendingProductResponse = await axios.get("https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/vending/products",{
      params: {
        countryCode : "NGA",
        categoryCode : categoryCode,
        provider: provider
      },
      headers: {
        'Content-Type': 'application/json',
        secretKey: process.env.REMITA_API_SECRET_KEY
      }
    });
    return getVendingProductResponse.data;
  } catch (error) {
    console.error('Error fetching Remita vending products:', error.message);
    throw new Error(error.getVendingCategoryResponse?.data?.message);
  }
};

exports.buyAirtime = async ({ amount, phoneNumber, provider}) => {
  let airtimeProviderCode = "";
  const account = "12345678910";
  switch (provider) {
    case 'mtn':
      airtimeProviderCode = 'airtime-mtn';
      break;
    case 'airtel':
      airtimeProviderCode = "186";
      break;
    case 'glo':
      airtimeProviderCode = "168";
      break;
    case '9mobile':
      airtimeProviderCode = "198";
      break;
    default:
      throw new Error('Unsupported provider');
  }
  const payload = {
    "productCode": airtimeProviderCode,
    "clientReference": process.env.REMITA_MERCHANT_ID || 'CON13084',
    "amount": amount,
    "data": {
      "accountNumber": account,
      "phoneNumber": phoneNumber,
    }
  };

  try{
    const response = await axios.post("https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/vending/transactions", {
        payload,
        headers: {
          'Content-Type': 'application/json',
          'secretKey': REMITA_API_SECRET,
          'apiKey': REMITA_API_KEY
        }
    });

    return response.data
  } catch (error) {
    console.error('Error buying airtime from Remita:', error.message);
    throw new Error(error.response?.data?.message);
  }
};


exports.getVendingCategory = async () => {
   try{
    const getVendingCategoryResponse = await axios.get(`https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/vending/categories?page=0&size=20`, {
      headers: {
        'Content-Type': 'application/json',
        secretKey: process.env.REMITA_API_SECRET_KEY
      }
    });
    return getVendingCategoryResponse.data;
   } catch (error) {
    console.error('Error fetching Remita vending categories:', error.message);
    throw new Error('Unable to retrieve vending categories from Remita');
    }
}

exports.getProvidersByCode = async (payLoad) => {
  const { categoryCode, provider } = payLoad;
  try {
    const getProvidersResponse = await axios.get(`https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/vending/providers/${categoryCode}`, {
      headers: {
        'Content-Type': 'application/json',
        secretKey: process.env.REMITA_API_SECRET_KEY
      }
    });

    return getProvidersResponse.data;
  } catch (error) {
    console.error('Error fetching Remita vending providers:', error.message);
    throw new Error('Unable to retrieve vending providers from Remita');
  }
}

