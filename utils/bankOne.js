const axios = require('axios');
const { User, Pin, Wallet } = require('../models');

const BANKONE_BASE_URL = process.env.BANKONE_BASE_URL;
const BANKONE_AUTHTOKEN = process.env.BANKONE_AUTHTOKEN;
const BANKONE_PRODUCT_CODE = process.env.BANKONE_PRODUCT_CODE;

exports.fundBankoneAccount = async (accountNumber, amount, description = 'Wallet Funding') => {
  const url = `${BANKONE_BASE_URL}/PostTransactionCreditCustomerAccount/2`;
  const response = await axios.post(url,
    {
      AccountNumber: accountNumber,
      TransactionAmount: amount,
      TransactionDesc: description,
      TransactionTrackingRef: `fund-${Date.now()}`,
      ProductCode: BANKONE_PRODUCT_CODE,
      Narration: 'Wallet funding via platform',
      DrCrIndicator: 'C' // CREDIT
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

exports.validateAccountNumber = async (req, res) => {
  const { AccountNumber, Bankcode } = req.body;
  if (!AccountNumber || !Bankcode) {
    return res.status(400).json({ error: 'Account number and bank code are required' });
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
    return res.status(200).json({ message: 'Account number is valid', data: response.data });
  } else {
    return res.status(400).json({ error: response.data.Description });
  }
  } catch (error) {
    console.error('❌ Validate account number error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to validate account number',
      details: error.response?.data || error.message
    });
  }
}

exports.transferLocalBank = async (req, res) => {
  const { AccountNumber, Bankcode, Amount, Description,ToAccountNumber } = req.body;
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

exports.intraBankTransfer = async (req, res) => {
  const { Amount, PayerAccountNumber, Payer, RecieversBankCode, ReceiverAccountNumber, ReceiverName, ReceiverPhoneNumber, ReceiverAccountType, ReceiverKYC, ReceiverBVN, Narration, NIPSessionID} = req.body;
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

exports.reverseTransfer = async (req, res) => {
  const { RetrievalReference,TransactionDate, TransactionType, Amount } = req.body;
  if (!RetrievalReference || !TransactionDate || !TransactionType || !Amount) {
    return res.status(400).json({ error: 'Retrieval reference, transaction date, transaction type and amount are required' });
  }

  const Token = BANKONE_AUTHTOKEN;

  try {
    const response = await axios.post(`https://staging.mybankone.com/thirdpartyapiservice/apiservice/ CoreTransactions/Reversal`, {
      RetrievalReference,
      TransactionDate,
      TransactionType,
      Token,
      Amount
    });

    return response.data;
  } catch (error) {
    console.error('❌ Reverse transfer error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.Description || error.message);
  }
}