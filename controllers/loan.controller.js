
const { User, Wallet, Transaction, Loan, sequelize, PaymentIntent, LoanTenor } = require('../models');
const { requestLoan, getLoanDetails, getCustomerLoans, repayLoan } = require('../utils/loanService');
const { updateBankoneCustomer } = require('./wallet.controller');
const bankOne = require('../utils/bankOne');
const { Op } = require('sequelize');
// const remita = require('../utils/remita');
const { v4: uuidv4 } = require('uuid');
const { createDirectDebitMandate } = require('./remitaService');




exports.initiateMandate = async (req, res) => {
  try {
    const response = await createDirectDebitMandate(req.body);
    res.status(200).json({ success: true, data: response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.initiateOtpForMandate = async (mandateId, requestId) => {
  const hash = generateApiDetailsHash({ mandateId, requestId });
  const headers = {
    'Content-Type': 'application/json',
    'MERCHANT_ID': process.env.REMITA_MERCHANT_ID,
    'API_KEY': process.env.REMITA_API_KEY,
    'REQUEST_ID': requestId,
    'REQUEST_TS': new Date().toISOString(),
    'API_DETAILS_HASH': hash
  };

  const body = { mandateId, requestId };

  try {
    const res = await axios.post(`${process.env.REMITA_BASE_URL}/remita/exapp/api/v1/send/api/echannelsvc/echannel/mandate/requestAuthorization`, body, { headers });
    return res.data;
  } catch (error) {
    console.error('OTP Initiation Error:', error.response?.data || error.message);
    throw error;
  }
};


exports.validateOtpActivation = async ({ remitaTransRef, authParams, requestId, requestTs }) => {
  const baseUrl = 'https://api-demo.remita.net/remita/exapp/api/v1/directdebit/mandate/validateAuthorization';
  const merchantId = process.env.REMITA_MERCHANT_ID;
  const apiKey = process.env.REMITA_API_KEY;

  const hashString = `${merchantId}${apiKey}${requestId}${requestTs}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  const headers = {
    'Content-Type': 'application/json',
    'MERCHANT_ID': merchantId,
    'API_KEY': apiKey,
    'REQUEST_ID': requestId,
    'REQUEST_TS': requestTs,
    'API_DETAILS_HASH': hash
  };

  const payload = {
    remitaTransRef,
    authParams
  };

  try {
    const response = await axios.post(baseUrl, payload, { headers });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
exports.applyForLoan = async (req, res) => {
  const { amount, tenor, purpose } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!user?.bankoneAccountNumber || !user?.bankoneCustomerId) {
    return res.status(400).json({ error: 'BankOne account or customer ID missing' });
  }

  try {
    const result = await requestLoan(user.bankoneAccountNumber, user.bankoneCustomerId, amount, tenor, purpose);
    if (!result.IsSuccessful) throw new Error(result.Description);

    res.status(201).json({
      message: 'Loan request submitted',
      reference: result.Payload?.LoanReference,
      status: result.Payload?.LoanStatus
    });
  } catch (err) {
    res.status(500).json({ error: 'Loan request failed', details: err.message });
  }
};
exports.createLoan = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user?.bankoneAccountNumber || !user?.bankoneCustomerId) {
    return res.status(400).json({ error: 'BankOne account or customer ID missing' });
  }
  const { type, amount, tenor } = req.body;
  if (!type || !amount || !tenor) {
    return res.status(400).json({ error: 'Type, amount and tenor are required' });
  }
  try {
    const loan = await Loan.create({
      type,
      amount,
      tenor,
      UserId: user.id
    });
    const updateAccount = await updateBankoneCustomer(req, res);
    if (!updateAccount) {
      return res.status(500).json({ error: 'Failed to update BankOne customer' });
    }
    res.status(201).json({ loan, message: 'Loan created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create loan', details: err.message });
  }
};

exports.getLoanInfo = async (req, res) => {
  const { reference } = req.params;

  try {
    const result = await getLoanDetails(reference);
    if (!result.IsSuccessful) throw new Error(result.Description);

    res.status(200).json({ loan: result.Payload });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve loan info', details: err.message });
  }
};

exports.getMyLoans = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user?.bankoneCustomerId) {
    return res.status(400).json({ error: 'BankOne customer ID missing' });
  }

  try {
    const result = await getCustomerLoans(user.bankoneCustomerId);
    if (!result.IsSuccessful) throw new Error(result.Description);

    res.status(200).json({ loans: result.Payload });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve loans', details: err.message });
  }
};

exports.repayLoan = async (req, res) => {
  const { loanAccountNumber, amount } = req.body;

  if (!loanAccountNumber || !amount) {
    return res.status(400).json({ error: 'loanAccountNumber and amount are required' });
  }

  try {
    const result = await repayLoan(loanAccountNumber, amount);
    if (!result.IsSuccessful) throw new Error(result.Description);

    res.status(200).json({
      message: 'Loan repayment successful',
      reference: result.Payload?.TransactionRef || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Loan repayment failed', details: err.message });
  }
};

exports.getLoanTenors = async (req, res) => {
  try {
    const tenors = await LoanTenor.findAll({
      attributes: ['id', 'tenor', 'amount']
    });
    res.status(200).json({ tenors });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve loan tenors', details: err.message });
  }
};

getLoanRate = async (req, res) => {
  try {

    const loanRate = await Loan.findOne({
      where: { type },
      attributes: ['id', 'type', 'rate']
    });

    if (!loanRate) {
      return res.status(404).json({ error: 'Loan rate not found for the specified type' });
    }

    res.status(200).json({ loanRate });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve loan rate', details: err.message });
  }
}

exports.createStandingOrder = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  
  if (!user?.bankoneAccountNumber || !user?.bankoneCustomerId) {
    return res.status(400).json({ error: 'BankOne account or customer ID missing' });
  }

  if (!amount || !frequency || !startDate || !endDate || !beneficiaryAccountNumber) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Assuming remita.createStandingOrder is a function that handles the standing order creation
    const result = await bankOne.createStandingOrder(req.body);

    if (!result.IsSuccessful) return res.status(400).json({error: result.Description});

    res.status(201).json({
      message: 'Standing order created successfully',
      reference: result.Payload?.Reference
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create standing order', details: err.message });
  }
}

exports.getStandingOrders = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  
  if (!user?.bankoneAccountNumber || !user?.bankoneCustomerId) {
    return res.status(400).json({ error: 'BankOne account or customer ID missing' });
  }

  try {
    const bankAccountNumber = user.bankoneAccountNumber;
    const param = {
      bankAccountNumber,
      pageIndex: req.query.pageIndex || 1,
      pageSize: req.query.pageSize || 10
    }
    const result = await bankOne.getStandingOrders(param);
    

    if (!result.IsSuccessful) return res.status(400).json({error: result.Description});

    res.status(200).json({ standingOrders: result.Payload });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve standing orders', details: err.message });
  }
};