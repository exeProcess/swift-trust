const { BankAccount } = require('../models');

const dojah = require('../utils/dojah');
const {getCommercialBankList, getMFBankList, validateAccountNumber, updateAccountTier, } = require('../utils/bankOne');

exports.addBankAccount = async (req, res) => {
  try {
    const { accountNumber, bankName, bankCode } = req.body;
    const verify = await dojah.resolveBankAccount(accountNumber, bankCode);

    const bank = await BankAccount.create({
      accountNumber,
      bankName,
      bankCode,
      UserId: req.user.id
    });
    res.status(201).json({ bank, resolved: verify.data });
  } catch (err) {
    res.status(400).json({ error: err.response?.data || err.message });
  }
};

exports.getMFBankAccounts = async (req, res) => {
  try {
    const banks = await getMFBankList();
    res.status(200).json(banks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch MFBank accounts', details: err.message });
  }
}

exports.updateAccountTier = async (req, res) => {
  try {
    const { accountNumber, bankCode, tier } = req.body;
    if (!accountNumber || !bankCode || !tier) {
      return res.status(400).json({ error: 'Account number, bank code and tier are required' });
    }

    const result = await updateAccountTier();
    res.status(result.status).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update account tier', details: err.message });
  }
}

exports.getCommercialBankAccounts = async (req, res) => {
  try {
    const banks = await getCommercialBankList();
    res.status(200).json(banks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Commercial Bank accounts', details: err.message });
  }
};

exports.validateAccountNumber = async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body;
    if (!accountNumber || !bankCode) {
      return res.status(400).json({ error: 'Account number and bank code are required' });
    }

    const result = await validateAccountNumber({ AccountNumber: accountNumber, Bankcode: bankCode });
    res.status(result.status).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate account number', details: err.message });
  }
}

exports.upd