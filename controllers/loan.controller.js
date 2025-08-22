
const { User, Wallet, Transaction, Loan, sequelize, PaymentIntent, LoanTenor } = require('../models');
const loanService = require('../utils/loanService');
const { updateBankoneCustomer } = require('./wallet.controller');
const bankOne = require('../utils/bankOne');
const { Op } = require('sequelize');
const remita = require('../utils/remita');
const { v4: uuidv4 } = require('uuid');
// const { createDirectDebitMandate } = require('./remitaService');


exports.eligibleAmount = async (req, res) => {
  const userId = req.user.id;
  try{
    const getEligibleAmount = await loanService.checkFirstTimer(userId);

    return res.status(200).json(getEligibleAmount);
  } catch(err){
    return res.status(500).json({error: err.message});
  }
}