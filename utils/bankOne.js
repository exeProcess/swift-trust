const axios = require('axios');

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