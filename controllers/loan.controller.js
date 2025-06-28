
const { User, Wallet, Transaction, Loan, sequelize, PaymentIntent, LoanTenor } = require('../models');
const { requestLoan, getLoanDetails, getCustomerLoans, repayLoan } = require('../utils/loanService');
const { Op } = require('sequelize');
const remita = require('../utils/remita');
const { v4: uuidv4 } = require('uuid');


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