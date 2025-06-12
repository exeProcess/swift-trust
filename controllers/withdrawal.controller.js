const { Wallet, Withdrawal, BankAccount, Transaction, sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');
const notifier = require('../utils/notifier');

exports.initiateWithdrawal = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { amount, bankAccountId } = req.body;
    const userId = req.user.id;

    const wallet = await Wallet.findOne({ where: { UserId: userId } });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const currentBalance = parseFloat(wallet.balance);
    if (currentBalance < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    const reference = uuidv4();
    const newBalance = currentBalance - parseFloat(amount);

    await wallet.update({ balance: newBalance }, { transaction: t });

    await Transaction.create({
      WalletId: wallet.id,
      type: 'debit',
      amount,
      description: 'Bank withdrawal',
      balanceBefore: currentBalance,
      balanceAfter: newBalance
    }, { transaction: t });

    const withdrawal = await Withdrawal.create({
      amount,
      reference,
      BankAccountId: bankAccountId,
      UserId: userId
    }, { transaction: t });

    await t.commit();

    await notifier.sendEmail(req.user.email, 'Withdrawal Requested', `You requested a withdrawal of ₦${amount}`);
    await notifier.sendSMS(req.user.phone, `You requested ₦${amount} withdrawal`);

    res.status(201).json({ message: 'Withdrawal initiated', reference });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

exports.getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.findAll({
      where: { UserId: req.user.id },
      include: ['BankAccount'],
      order: [['createdAt', 'DESC']]
    });
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.withdrawToBankManual = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { amount, accountNumber, bankCode, bankName } = req.body;
    const userId = req.user.id;

    if (!amount || !accountNumber || !bankCode || !bankName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const wallet = await Wallet.findOne({ where: { UserId: userId } });
    const balanceBefore = parseFloat(wallet.balance);
    const transferAmount = parseFloat(amount);
    if (balanceBefore < transferAmount) return res.status(400).json({ error: 'Insufficient balance' });

    const newBalance = balanceBefore - transferAmount;
    const reference = uuidv4();

    await wallet.update({ balance: newBalance }, { transaction: t });
    await Transaction.create({
      WalletId: wallet.id,
      type: 'debit',
      amount: transferAmount,
      description: `External bank transfer (${bankName})`,
      balanceBefore,
      balanceAfter: newBalance
    }, { transaction: t });

    const withdrawal = await Withdrawal.create({
      amount: transferAmount,
      reference,
      UserId: userId,
      accountNumber,
      bankCode,
      bankName
    }, { transaction: t });

    const remitaResult = await require('../utils/remita').sendToBank({
      amount: transferAmount,
      accountNumber,
      bankCode,
      reference
    });

    await withdrawal.update({ status: remitaResult.status });
    await t.commit();

    await notifier.sendEmail(req.user.email, 'Transfer to Bank', `₦${amount} sent to ${accountNumber} (${bankName})`);
    await notifier.sendSMS(req.user.phone, `₦${amount} sent to ${accountNumber} (${bankName})`);

    res.status(201).json({ message: 'Transfer to bank initiated', reference });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

exports.retryFailedWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawal = await Withdrawal.findOne({ where: { id, UserId: req.user.id } });
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    if (withdrawal.status !== 'failed') return res.status(400).json({ error: 'Only failed withdrawals can be retried' });

    const result = await require('../utils/remita').sendToBank({
      amount: withdrawal.amount,
      accountNumber: withdrawal.accountNumber,
      bankCode: withdrawal.bankCode,
      reference: withdrawal.reference
    });

    await withdrawal.update({ status: result.status });

    res.json({ message: 'Retry complete', status: result.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.withdrawToBank = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { amount, bankAccountId } = req.body;
//     const userId = req.user.id;

//     if (!amount || !bankAccountId) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const wallet = await Wallet.findOne({ where: { UserId: userId } });
//     if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

//     const balanceBefore = parseFloat(wallet.balance);
//     const transferAmount = parseFloat(amount);
//     if (balanceBefore < transferAmount) return res.status(400).json({ error: 'Insufficient balance' });

//     const newBalance = balanceBefore - transferAmount;
//     const reference = uuidv4();

//     await wallet.update({ balance: newBalance }, { transaction: t });
//     await Transaction.create({
//       WalletId: wallet.id,
//       type: 'debit',
//       amount: transferAmount,
//       description: 'Bank withdrawal',
//       balanceBefore,
//       balanceAfter: newBalance
//     }, { transaction: t });

//     const withdrawal = await Withdrawal.create({
//       amount: transferAmount,
//       reference,
//       BankAccountId: bankAccountId,
//       UserId: userId
//     }, { transaction: t });

//     await t.commit();

//     await notifier.sendEmail(req.user.email, 'Withdrawal Requested', `You requested a withdrawal of ₦${amount}`);
//     await notifier.sendSMS(req.user.phone, `You requested ₦${amount} withdrawal`);

//     res.status(201).json({ message: 'Withdrawal initiated', reference });
//   } catch (err) {
//     await t.rollback();
//     res.status(500).json({ error: err.message });
//   }
// };
