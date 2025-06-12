const { BankAccount } = require('../models');

const dojah = require('../utils/dojah');

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