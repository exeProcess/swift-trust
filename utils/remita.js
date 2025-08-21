const axios = require('axios');
const crypto = require('crypto');
const { User, Wallet, Transaction, sequelize} = require('../models');


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



exports.getVendingProducts = async (payload) => {
  
  const { providerCode, categoryCode } = payload;
  

  try{
    const getVendingProductResponse = await axios.get("https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/vending/products",{
      params: {
        page: 0,
        pageSize: 20,
        countryCode: 'NGA',
        categoryCode,
        provider: providerCode
      },
      headers: {
        'Content-Type': 'application/json',
        'secretKey': "sk_test_B+y9/BpYxgz5bxepOkEO1IEh5emZ+Kg6tstibGNi94l4FsX4ZiIBPI4j7bbSux4n"
      }
    });
    return getVendingProductResponse.data;
  } catch (error) {
    console.error('Error fetching Remita vending products:', error.message);
    throw new Error(error.getVendingCategoryResponse?.data?.message);
  }
};

exports.buyAirtimeOrData = async (rawData) => {
  const account = "12345678910";
  const { amount, phoneNumber, product, category} = rawData;
  // const payload = 
  // };

  try{
    const response = await axios.post(
      "https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/vending/transactions",
      {
        productCode: product,
        clientReference: `Airtime-${Date.now()}`,
        amount: amount,
        data: {
          accountNumber: account,
          phoneNumber: phoneNumber,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'secretKey': "remi_test_sk_YVZ6OXpRcHdmaitoOUU3TGZya1Fob2IxZSt1bUxMdnV3ZlZtb1E9PTdlM2M0ZjYyYzc2MzQ0YzA2YTFlODFhYWE2MmI5MzU2NzQ4NWY0OTY3ZDM1YmEzOWMzOTczZDk1YzU5NjE3NWM=",
        }
      }
    );
    if(response.data.status == "00" && response.data.message == "Success"){
      const transaction = await Transaction.create({
        userId: req.user.id,
        title: category,
        type: 'bill payment',
        amount: amount,
        description: `Purchased ${response.data.productName} for ${response.data.phoneNumber}`,
      });
    }
            
            
        
    return response.data
  } catch (error) {
    console.error('Error buying airtime from Remita:', error.message);
    throw new Error(error.response?.data?.message);
  }
};

exports.buyElectricityOrCableTvSubscription = async (rawData) => {
  const { amount, productCode, destination, category} = rawData;
  // const payload = 
  // };

  try{
    const response = await axios.post(
      "https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/vending/transactions",
      {
        productCode: productCode,
        clientReference: `ENERGY-${Date.now()}`,
        amount: amount,
        data: {
          accountNumber: destination,
          phoneNumber: phoneNumber,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'secretKey': "remi_test_sk_YVZ6OXpRcHdmaitoOUU3TGZya1Fob2IxZSt1bUxMdnV3ZlZtb1E9PTdlM2M0ZjYyYzc2MzQ0YzA2YTFlODFhYWE2MmI5MzU2NzQ4NWY0OTY3ZDM1YmEzOWMzOTczZDk1YzU5NjE3NWM=",
        }
      }
    );
    if(response.data.status == "00" && response.data.message == "Success"){
      const transaction = await Transaction.create({
        userId: req.user.id,
        title: category,
        type: 'bill payment',
        amount: amount,
        description: `Purchased ${response.data.productName} for ${response.data.phoneNumber}`,
      });
    }
    return response.data
  } catch (error) {
    console.error('Error buying airtime from Remita:', error.message);
    throw new Error(error.response?.data?.message);
  }
};


// exports.buyData = async (rawData) => {
//   const 


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

exports.getRemitaBankList = async () => {
  try {
    const response = await axios.get('https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/interbank/transaction/bank/list', {
      headers: {
        'Content-Type': 'application/json',
        'secretKey': "remi_test_sk_YVZ6OXpRcHdmaitoOUU3TGZya1Fob2IxZSt1bUxMdnV3ZlZtb1E9PTdlM2M0ZjYyYzc2MzQ0YzA2YTFlODFhYWE2MmI5MzU2NzQ4NWY0OTY3ZDM1YmEzOWMzOTczZDk1YzU5NjE3NWM=",
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching bank list from Remita:', error.message);
    throw new Error('Unable to retrieve bank list from Remita');
  }
} 

exports.nameEnquiry = async (accountNumber, bankCode) => {
  try {
    const response = await axios.post('https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/interbank/name/enquiry', {
      destinationAccountNumber: accountNumber,
      destinationBankCode: bankCode
    }, {
      headers: {
        'Content-Type': 'application/json',
        'secretKey': "remi_test_sk_YVZ6OXpRcHdmaitoOUU3TGZya1Fob2IxZSt1bUxMdnV3ZlZtb1E9PTdlM2M0ZjYyYzc2MzQ0YzA2YTFlODFhYWE2MmI5MzU2NzQ4NWY0OTY3ZDM1YmEzOWMzOTczZDk1YzU5NjE3NWM="
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error performing name enquiry:', error.message);
    throw new Error('Unable to perform name enquiry');
  }
}

// exports.fundWallet = async (data) => {

//   try {
//     const response = await axios.post(
//       'https://api-demo.systemspecsng.com/services/connect-gateway/api/v1/integration/single/payment',
//       {
//         amount: 3400,
//         transactionRef: `trx-${Date.now()}', // Replace with actual transaction reference
//         transactionDescription: "Test Transaction",
//         channel: "WEB",
//         currency: "NGN",
//         destinationAccount: "0586957398",
//         destinationAccountName: "Paul Reed",
//         destinationBankCode: "058",
//         destinationEmail: "donald@yupmail.com",
//         sourceAccount: "0442999282",
//         sourceAccountName: "James John",
//         sourceBankCode: "044",
//         originalAccountNumber: "2142999282",
//         originalBankCode: "214",
//         customReference: ""
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           // Add authentication headers here if required
//           // e.g. "Authorization": `Bearer ${process.env.ACCESS_TOKEN}`
//         }
//       }
//     );

//     console.log("Payment Response:", response.data);
//   } catch (error) {
//     console.error("Error making payment:", error.response ? error.response.data : error.message);
//   }
// }