const axios = require('axios');
const { User, Pin, Wallet } = require('../models');

const BANKONE_BASE_URL = process.env.BANKONE_BASE_URL;
const BANKONE_AUTHTOKEN = process.env.BANKONE_AUTHTOKEN;
const BANKONE_PRODUCT_CODE = process.env.BANKONE_PRODUCT_CODE;

exports.fundBankoneAccount = async (accountNumber, amount, description = 'Wallet Funding') => {
  const url = `https://staging.mybankone.com/thirdpartyapiservice/apiservice/ CoreTransactions/Credit`;
  const response = await axios.post(url,
    {
      AccountNumber: accountNumber,
      Amount: amount,
      RetrievalReference: `fund-${Date.now()}`,
      NibssCode: '888888',
      Token: BANKONE_AUTHTOKEN,
      Narration: description,
    }
  );
  return response.data;
};
exports.debitBankoneAccount = async (accountNumber, amount, description = 'Wallet Debit') => {
  const url = `https://staging.mybankone.com/thirdpartyapiservice/apiservice/CoreTransactions/Debit`;
  const response = await axios.post(url,
    {
      AccountNumber: accountNumber,
      Amount: amount,
      RetrievalReference: `fund-${Date.now()}`,
      NibssCode: '888888',
      Token: BANKONE_AUTHTOKEN,
      Narration: description,
    }
  );
  return response.data;
};


exports.withdrawFromBankoneAccount = async (accountNumber, amount, description = 'Wallet Withdrawal') => {
  const url = `${BANKONE_BASE_URL}/PostTransactionDebitCustomerAccount/2`;
  const response = await axios.post(url,
    {
      AccountNumber: accountNumber,
      TransactionAmount: amount,
      TransactionDesc: description,
      TransactionTrackingRef: `wd-${Date.now()}`,
      ProductCode: BANKONE_PRODUCT_CODE,
      Narration: 'Withdrawal to external bank',
      DrCrIndicator: 'D' // DEBIT
    },
    {
      params: {
        authtoken: BANKONE_AUTHTOKEN,
        version: '2'
      }
    }
  );
  return response.data;
};

exports.validateAccountNumber = async (data) => {
  const { AccountNumber, Bankcode } = data;
  if (!AccountNumber || !Bankcode) {
    return {status: 400, error: 'Account number and bank code are required' };
  }
  try {
     const response = await axios.post(`https://staging.mybankone.com/thirdpartyapiservice/apiservice/Transfer/ NameEnquiry`,
     {
      AccountNumber,
      Bankcode,
      authtoken: BANKONE_AUTHTOKEN,
    }
  );
  if (response.data.IsSuccessful) {
    return {status: 200, message: 'Account number is valid', data: response.data };
  } else {
    return {status: 400, error: response.data.Description };
  }
  } catch (error) {
    console.error('❌ Validate account number error:', error.response?.data || error.message);
    return {
      status: 500,
      error: 'Failed to validate account number',
      details: error.response?.data || error.message
    };
  }
}

exports.transferLocalBank = async (data) => {
  const { AccountNumber, Bankcode, Amount, Description,ToAccountNumber } = data;
  if (!AccountNumber || !Bankcode || !Amount) {
    return res.status(400).json({ error: 'Account number, bank code, and amount are required' });
  }
  
  try {
    const response = await axios.post(`https://staging.mybankone.com/thirdpartyapiservice/apiservice/ CoreTransactions/LocalFundsTransfer`, {
      FromAccountNumber,
      ToAccountNumber,
      Amount,
      RetrievalReference: `transfer-${Date.now()}`,
      ProductCode: BANKONE_PRODUCT_CODE,
      Narration: Description,
      AuthenticationKey: BANKONE_AUTHTOKEN
  });

    return res.status(200).json({message: response.data});
  } catch (error) {
    console.error('❌ Transfer to local bank error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to transfer to local bank',
      details: error.response?.data || error.message
    });
  }
}


exports.getCommercialBankList = async () => {
  const url = `https://staging.mybankone.com/thirdpartyapiservice/apiservice/BillsPayment/ GetCommercialBanks/${BANKONE_AUTHTOKEN}`;
  const response = await axios.get(url);
  return response.data;
};

exports.getMFBankList = async () => {
  const url = `https://staging.mybankone.com/thirdpartyapiservice/apiservice/BillsPayment/ GetBillers/${BANKONE_AUTHTOKEN}`;
  const response = await axios.get(url);
  return response.data;
};

exports.intraBankTransfer = async (data) => {
  const { Amount, PayerAccountNumber, Payer, RecieversBankCode, ReceiverAccountNumber, ReceiverName, ReceiverPhoneNumber, ReceiverAccountType, ReceiverKYC, ReceiverBVN, Narration, NIPSessionID} = data;
  if (!PayerAccountNumber || !ReceiverAccountNumber || !Amount || !NIPSessionID || !RecieversBankCode, !ReceiverName) {
    return res.status(400).json({ error: 'Payer account number, receiver account number, amount, NIP session ID, receiver bank code and receiver name are required' });

  }

  const Receiver = await User.findOne({ where: { bankoneAccountNumber: ReceiverAccountNumber } });
  if (!Receiver) {
    return res.status(404).json({ error: 'Receiver account not found' });
  }
  if (Receiver.bankoneAccountNumber === PayerAccountNumber) {
    return res.status(400).json({ error: 'Cannot transfer to the same account' });
  }

  const AppZoneAccount = "0000000000";
  const Token = BANKONE_AUTHTOKEN

  try {
    const response = await axios.post(`https://staging.mybankone.com/thirdpartyapiservice/apiservice/Transfer/InterbankTransfer`, {
      Amount,
      AppZoneAccount,
      Token,
      PayerAccountNumber,
      Payer,
      RecieversBankCode,
      ReceiverAccountNumber,
      ReceiverName,
      ReceiverPhoneNumber,
      ReceiverAccountType,
      ReceiverKYC,
      ReceiverBVN: Receiver.bvn,
      TransactionTrackingRef: `transfer-${Date.now()}`,
      ProductCode: BANKONE_PRODUCT_CODE,
      Narration,
      NIPSessionID
    }, {
      params: {
        authtoken: BANKONE_AUTHTOKEN,
        version: '2'
      }
    });FromAccountNumber

    return response.data;
  } catch (error) {
    console.error('❌ Intra-bank transfer error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.Description || error.message);
  }
}

exports.reverseTransfer = async (data) => {
  const { RetrievalReference,TransactionDate, TransactionType, Amount } = data;
  if (!RetrievalReference || !TransactionDate || !TransactionType || !Amount) {
    return {status: 400, error: 'Retrieval reference, transaction date, transaction type and amount are required' };
  }

  const Token = BANKONE_AUTHTOKEN;

  try {
    const response = await axios.post(`https://staging.mybankone.com/thirdpartyapiservice/apiservice/CoreTransactions/Reversal`, {
      RetrievalReference,
      TransactionDate,
      TransactionType,
      Token,
      Amount
    });

    return response.data;
  } catch (error) {
    console.error('❌ Reverse transfer error:', error.response?.data || error.message);
    return {status: 500, message: error.response?.data?.Description || error.message};
  }
}


exports.updateAccountTier = async () => {
  const user = User.findOne({ where: { id: req.user.id} });
  if (!user.bankoneAccountNumber || !user.bankoneCustomerId) {
    return {status: 404, error: 'User does not have a BankOne account or customer ID'};
  }

  const url = `https://staging.mybankone.com/thirdpartyapiservice/apiservice/Account/UpdateAccountTier`;
  try {
    const response = await axios.post(url, {
      AccountNumber: user.bankoneAccountNumber,
      AccountTier: 2, 
      SkipAddressVerification: true,
      CustomerID: user.bankoneCustomerId,
      FullName: `${user.firstName} ${user.lastName}`
    });

    return response.data;
  } catch (error) {
    console.error('❌ Update account tier error:', error.response?.data || error.message);
    return {status: 500, error: 'Failed to update account tier', details: error.response?.data || error.message};
  }
}

exports.createStandingOrder = async (data) => {
  const { Name, Description, CreditAccount, DebitAccount, AccountNumber, AmountToTransfer, Frequency, StartDate, EndDate } = data;
  if (!Name || !Description || !CreditAccount || !DebitAccount || !AccountNumber || !AmountToTransfer || !Frequency || !StartDate || !EndDate) {
    return {status: 400, error: 'All fields are required'};
  }
  if (new Date(StartDate) < new Date()) {
    return {status: 400, error: 'Start date cannot be in the past'};
  }
  if (new Date(EndDate) <= new Date(StartDate)) {
    return {status: 400, error: 'End date must be after start date'};
  }

  const url = `https://staging.mybankone.com/thirdpartyapiservice/apiservice/StandingOrder/Create`;
  try {
    const response = await axios.post(url, {
      Name,
      Description,
      CreditAccount,
      DebitAccount,
      AccountNumber,
      AmountToTransfer,
      Frequency,
      AllowForceDebit: true,
      IsPercentage: false,
      StandingOrderFrequency: Frequency,
      StartDate,
      EndDate,
      StandingOrderChargeFeeID: 1,
      StandingOrderChargeFeeAmount: 200
    });

    return response.data;
  } catch (error) {
    console.error('❌ Create standing order error:', error.response?.data || error.message);
    return {status: 500, error: 'Failed to create standing order', details: error.response?.data || error.message};
  }
}

exports.getBankOneStandingOrders = async (param) => {

   const { debitaccountNumber, pageIndex, pageSize } = param;
   if (!AccountNumber || !StartDate || !EndDate) {
      return {status: 400, error: 'Account number, start date and end date are required'};
    }
  const url = `http://api.mybankone.com/BankOneWebAPI/api/StandingOrder/GetStandingOrdersByDebitAccountNumber?${debitaccountNumber}=&pageIndex${pageIndex}=&pageSize=${pageSize}`;
  try {
    const response = await axios.get(url, {
      params: {
        debitaccountNumber,
        pageIndex,
        pageSize
      }
    });

    return response.data;
  } catch (error) {
    console.error('❌ Get BankOne standing orders error:', error.response?.data || error.message);
    return {status: 500, error: 'Failed to retrieve standing orders', details: error.response?.data || error.message};
  }
}

exports.createBankOneCustomerAndAccount = async (data) => {
  const { 
    id,
    bvn,
    first_name, 
    last_name, 
    middle_name, 
    phone_number1, 
    state_of_origin, 
    gender, 
    date_of_birth, 
    residential_address,
    nextOfnextOfKinPhoneNumber,
    nextOfKinName,
    nin, 
    email 
  } = data;

  try {
    const bankoneRes = await axios.post(
      `http://staging.mybankone.com/BankOneWebAPI/api/Account/CreateCustomerAndAccount/`,
      {
        TransactionTrackingRef: `trx-${Date.now()}-${id}`,
        AccountOpeningTrackingRef: `acct-${Date.now()}-${id}`,
        ProductCode: "005",
        LastName: last_name,
        OtherNames: middle_name,
        BVN: bvn,
        PhoneNo: phone_number1,
        Gender: gender,
        PlaceOfBirth: state_of_origin,
        DateOfBirth: date_of_birth,
        Address: residential_address,
        NationalIdentityNo: nin,
        NextOfKinPhoneNo: nextOfnextOfKinPhoneNumber,
        NextOfKinName: nextOfKinName,
        HasSufficientInfoOnAccountInfo: true,
        AccountOfficerCode: "005",
        AccountInformationSource: 1,
        Email: email,
        NotificationPreference: 1,
        TransactionPermission: 1,
        AccountTier: 1,
        FirstName: first_name
      },
      {
        params: { authToken: process.env.BANKONE_AUTHTOKEN, version: '2' }
      }
    );

    const bankoneData = bankoneRes.data;
    if (!bankoneData.IsSuccessful) {
      console.warn('BankOne account creation failed:', bankoneData.Description);
      // optionally: store this result for retrying later
      throw new Error("BankOne account creation failed");
    } 

    return bankoneData.message;
    
  } catch (error) {
    return {error: bankoneData?.message};
  }
}