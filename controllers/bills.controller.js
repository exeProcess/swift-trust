const { Wallet, Transaction, BillPayment, sequelize } = require('../models');
const remita = require('../utils/remita');
const { v4: uuidv4 } = require('uuid');

exports.payBill = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { type, target, amount } = req.body;
    const userId = req.user.id;
    const reference = uuidv4();

    const wallet = await Wallet.findOne({ where: { UserId: userId } });
    const currentBalance = parseFloat(wallet.balance);
    const billAmount = parseFloat(amount);
    if (currentBalance < billAmount) return res.status(400).json({ error: 'Insufficient balance' });

    const newBalance = currentBalance - billAmount;
    await wallet.update({ balance: newBalance }, { transaction: t });

    await Transaction.create({
      WalletId: wallet.id,
      type: 'debit',
      amount: billAmount,
      description: `Utility bill payment - ${type}`,
      balanceBefore: currentBalance,
      balanceAfter: newBalance
    }, { transaction: t });

    const result = await remita.payUtilityBill({ type, target, amount: billAmount, reference });

    await BillPayment.create({
      type,
      target,
      amount,
      providerRef: result.provider_reference || reference,
      status: result.status || 'pending',
      metadata: result,
      UserId: userId
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Bill payment successful', reference, result });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

exports.getBillPayments = async (req, res) => {
  try {
    const bills = await BillPayment.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.buyAirtime = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { phone, amount } = req.body;
    const userId = req.user.id;
    const reference = uuidv4();

    const wallet = await Wallet.findOne({ where: { UserId: userId } });
    const balance = parseFloat(wallet.balance);
    const value = parseFloat(amount);
    if (balance < value) return res.status(400).json({ error: 'Insufficient balance' });

    await wallet.update({ balance: balance - value }, { transaction: t });
    await Transaction.create({
      WalletId: wallet.id,
      type: 'debit',
      amount: value,
      description: 'Airtime purchase',
      balanceBefore: balance,
      balanceAfter: balance - value
    }, { transaction: t });

    const result = await remita.payUtilityBill({ type: 'airtime', target: phone, amount: value, reference });

    await BillPayment.create({
      type: 'airtime',
      target: phone,
      amount: value,
      providerRef: result.provider_reference || reference,
      status: result.status || 'pending',
      metadata: result,
      UserId: userId
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Airtime purchased', reference });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

exports.payElectricity = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { meter, amount } = req.body;
    const userId = req.user.id;
    const reference = uuidv4();

    const wallet = await Wallet.findOne({ where: { UserId: userId } });
    const balance = parseFloat(wallet.balance);
    const value = parseFloat(amount);
    if (balance < value) return res.status(400).json({ error: 'Insufficient balance' });

    await wallet.update({ balance: balance - value }, { transaction: t });
    await Transaction.create({
      WalletId: wallet.id,
      type: 'debit',
      amount: value,
      description: 'Electricity bill payment',
      balanceBefore: balance,
      balanceAfter: balance - value
    }, { transaction: t });

    const result = await remita.payUtilityBill({ type: 'electricity', target: meter, amount: value, reference });

    await BillPayment.create({
      type: 'electricity',
      target: meter,
      amount: value,
      providerRef: result.provider_reference || reference,
      status: result.status || 'pending',
      metadata: result,
      UserId: userId
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Electricity payment successful', reference });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};


exports.payDSTV = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { smartcard, amount } = req.body;
    const userId = req.user.id;
    const reference = uuidv4();

    const wallet = await Wallet.findOne({ where: { UserId: userId } });
    const balance = parseFloat(wallet.balance);
    const value = parseFloat(amount);
    if (balance < value) return res.status(400).json({ error: 'Insufficient balance' });

    await wallet.update({ balance: balance - value }, { transaction: t });
    await Transaction.create({
      WalletId: wallet.id,
      type: 'debit',
      amount: value,
      description: 'DSTV subscription',
      balanceBefore: balance,
      balanceAfter: balance - value
    }, { transaction: t });

    const result = await remita.payUtilityBill({ type: 'dstv', target: smartcard, amount: value, reference });

    await BillPayment.create({
      type: 'dstv',
      target: smartcard,
      amount: value,
      providerRef: result.provider_reference || reference,
      status: result.status || 'pending',
      metadata: result,
      UserId: userId
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'DSTV subscription successful', reference });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

exports.payGoTV = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { smartcard, amount } = req.body;
    const userId = req.user.id;
    const reference = uuidv4();

    const wallet = await Wallet.findOne({ where: { UserId: userId } });
    const balance = parseFloat(wallet.balance);
    const value = parseFloat(amount);
    if (balance < value) return res.status(400).json({ error: 'Insufficient balance' });

    await wallet.update({ balance: balance - value }, { transaction: t });
    await Transaction.create({
      WalletId: wallet.id,
      type: 'debit',
      amount: value,
      description: 'GoTV subscription',
      balanceBefore: balance,
      balanceAfter: balance - value
    }, { transaction: t });

    const result = await remita.payUtilityBill({ type: 'gotv', target: smartcard, amount: value, reference });

    await BillPayment.create({
      type: 'gotv',
      target: smartcard,
      amount: value,
      providerRef: result.provider_reference || reference,
      status: result.status || 'pending',
      metadata: result,
      UserId: userId
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'GoTV subscription successful', reference });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

exports.payStartimes = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { smartcard, amount } = req.body;
    const userId = req.user.id;
    const reference = uuidv4();

    const wallet = await Wallet.findOne({ where: { UserId: userId } });
    const balance = parseFloat(wallet.balance);
    const value = parseFloat(amount);
    if (balance < value) return res.status(400).json({ error: 'Insufficient balance' });

    await wallet.update({ balance: balance - value }, { transaction: t });
    await Transaction.create({
      WalletId: wallet.id,
      type: 'debit',
      amount: value,
      description: 'Startimes subscription',
      balanceBefore: balance,
      balanceAfter: balance - value
    }, { transaction: t });

    const result = await remita.payUtilityBill({ type: 'startimes', target: smartcard, amount: value, reference });

    await BillPayment.create({
      type: 'startimes',
      target: smartcard,
      amount: value,
      providerRef: result.provider_reference || reference,
      status: result.status || 'pending',
      metadata: result,
      UserId: userId
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Startimes subscription successful', reference });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

exports.paySpectranet = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { customerId, amount } = req.body;
    const userId = req.user.id;
    const reference = uuidv4();

    const wallet = await Wallet.findOne({ where: { UserId: userId } });
    const balance = parseFloat(wallet.balance);
    const value = parseFloat(amount);
    if (balance < value) return res.status(400).json({ error: 'Insufficient balance' });

    await wallet.update({ balance: balance - value }, { transaction: t });
    await Transaction.create({
      WalletId: wallet.id,
      type: 'debit',
      amount: value,
      description: 'Spectranet payment',
      balanceBefore: balance,
      balanceAfter: balance - value
    }, { transaction: t });

    const result = await remita.payUtilityBill({ type: 'spectranet', target: customerId, amount: value, reference });

    await BillPayment.create({
      type: 'spectranet',
      target: customerId,
      amount: value,
      providerRef: result.provider_reference || reference,
      status: result.status || 'pending',
      metadata: result,
      UserId: userId
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Spectranet payment successful', reference });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

exports.paySmile = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { customerId, amount } = req.body;
    const userId = req.user.id;
    const reference = uuidv4();

    const wallet = await Wallet.findOne({ where: { UserId: userId } });
    const balance = parseFloat(wallet.balance);
    const value = parseFloat(amount);
    if (balance < value) return res.status(400).json({ error: 'Insufficient balance' });

    await wallet.update({ balance: balance - value }, { transaction: t });
    await Transaction.create({
      WalletId: wallet.id,
      type: 'debit',
      amount: value,
      description: 'Smile payment',
      balanceBefore: balance,
      balanceAfter: balance - value
    }, { transaction: t });

    const result = await remita.payUtilityBill({ type: 'smile', target: customerId, amount: value, reference });

    await BillPayment.create({
      type: 'smile',
      target: customerId,
      amount: value,
      providerRef: result.provider_reference || reference,
      status: result.status || 'pending',
      metadata: result,
      UserId: userId
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Smile payment successful', reference });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};