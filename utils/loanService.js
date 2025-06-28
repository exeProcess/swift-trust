// services/loanService.js
const axios = require('axios');

const BANKONE_BASE_URL = process.env.BANKONE_BASE_URL;
const BANKONE_AUTHTOKEN = process.env.BANKONE_AUTHTOKEN;
const BANKONE_PRODUCT_CODE = process.env.BANKONE_PRODUCT_CODE;
const BANKONE_LOAN_PRODUCT_CODE = process.env.BANKONE_LOAN_PRODUCT_CODE;

exports.requestLoan = async (accountNumber, customerId, amount, tenor = 6, purpose = 'Personal Loan') => {
  const response = await axios.get(
    `http://staging.mybankone.com/BankOneWebAPI/api/Loan/LoanApplication/LoanCreationApplication2/version?authToken=${BANKONE_AUTHTOKEN}&mfbCode=${BANKONE_PRODUCT_CODE}`,
    {
      AccountNumber: accountNumber,
      Amount: amount,
      LoanProductCode: BANKONE_LOAN_PRODUCT_CODE,
      RepaymentFrequency: 'Monthly',
      RepaymentTenor: tenor,
      Purpose: purpose,
      TransactionTrackingRef: `loan-${Date.now()}`,
      ProductCode: BANKONE_PRODUCT_CODE,
      Narration: 'Loan request from platform',
      CustomerID: customerId
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

exports.getLoanDetails = async (loanReference) => {
  const response = await axios.get(
    `http://staging.mybankone.com/BankOneWebAPI/api/Loan/GetLoansByCustomerId/2?authToken=${BANKONE_AUTHTOKEN}`,
    {
      params: {
        loanReference
      }
    }
  );

  return response.data;
};

exports.getCustomerLoans = async (customerId) => {
  const response = await axios.get(
    `${BANKONE_BASE_URL}/GetLoansByCustomerID/2`,
    {
      params: {
        customerID: customerId,
        authtoken: BANKONE_AUTHTOKEN,
        version: '2'
      }
    }
  );

  return response.data;
};

exports.repayLoan = async (loanAccountNumber, amount) => {
  const response = await axios.post(
    `${BANKONE_BASE_URL}/PostTransactionCreditCustomerAccount/2`,
    {
      AccountNumber: loanAccountNumber,
      TransactionAmount: amount,
      TransactionDesc: 'Loan Repayment',
      TransactionTrackingRef: `loan-repay-${Date.now()}`,
      ProductCode: BANKONE_PRODUCT_CODE,
      Narration: 'Loan repayment from user wallet',
      DrCrIndicator: 'C'
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
exports.getLoanRepaymentSchedule = async (loanReference) => {
  const response = await axios.get(
    `http://staging.mybankone.com/BankOneWebAPI/api/Loan/GetLoanRepaymentSchedule/2?loanAccountNumber=${loanReference}`,
    {
      params: {
        loanReference,
      }
    }
  );

  return response.data;
};
exports.getLoanRepaymentHistory = async (loanReference) => {
  const response = await axios.get(
    `${BANKONE_BASE_URL}/GetLoanRepaymentHistory/2`,
    {
      params: {
        loanReference,
        authtoken: BANKONE_AUTHTOKEN,
        version: '2'
      }
    }
  );

  return response.data;
};
exports.getLoanStatus = async (loanReference) => {
  const response = await axios.get(
    `${BANKONE_BASE_URL}/GetLoanStatus/2`,
    {
      params: {
        loanReference,
        authtoken: BANKONE_AUTHTOKEN,
        version: '2'
      }
    }
  );

  return response.data;
};
exports.getLoanAccountBalance = async (loanAccountNumber) => {
  const response = await axios.get(
    `${BANKONE_BASE_URL}/GetAccountBalance/2`,
    {
      params: {
        accountNumber: loanAccountNumber,
        authtoken: BANKONE_AUTHTOKEN,
        version: '2'
      }
    }
  );

  return response.data;
};
exports.getLoanAccountDetails = async (loanAccountNumber) => {
  const response = await axios.get(
    `${BANKONE_BASE_URL}/GetAccountDetailsByAccountNumber/2`,
    {
      params: {
        accountNumber: loanAccountNumber,
        authtoken: BANKONE_AUTHTOKEN,
        version: '2'
      }
    }
  );

  return response.data;
};
exports.getLoanAccountTransactions = async (loanAccountNumber) => {
  const response = await axios.get(
    `${BANKONE_BASE_URL}/GetAccountTransactions/2`,
    {
      params: {
        accountNumber: loanAccountNumber,
        authtoken: BANKONE_AUTHTOKEN,
        version: '2'
      }
    }
  );

  return response.data;
};
exports.getLoanAccountStatement = async (loanAccountNumber, startDate, endDate) => {
  const response = await axios.get(
    `${BANKONE_BASE_URL}/GetAccountStatement/2`,
    {
      params: {
        accountNumber: loanAccountNumber,
        startDate,
        endDate,
        authtoken: BANKONE_AUTHTOKEN,
        version: '2'
      }
    }
  );

  return response.data;
};
exports.getLoanAccountSummary = async (loanAccountNumber) => {
  const response = await axios.get(
    `${BANKONE_BASE_URL}/GetAccountSummary/2`,
    {
      params: {
        accountNumber: loanAccountNumber,
        authtoken: BANKONE_AUTHTOKEN,
        version: '2'
      }
    }
  );

  return response.data;
};
exports.getLoanAccountInterestRate = async (loanAccountNumber) => {
  const response = await axios.get(
    `${BANKONE_BASE_URL}/GetLoanInterestRate/2`,
    {
      params: {
        accountNumber: loanAccountNumber,
        authtoken: BANKONE_AUTHTOKEN,
        version: '2'
      }
    }
  );

  return response.data;
};

