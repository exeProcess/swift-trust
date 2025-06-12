const { Wallet, Transaction, User, sequelize } = require('../models');
const notifier = require('../utils/notifier');

exports.getTransactions = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ where: { UserId: req.user.id } });
    const transactions = await Transaction.findAll({ where: { WalletId: wallet.id }, order: [['createdAt', 'DESC']] });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.transferFunds = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { receiverPhone, amount, description } = req.body;
    const sender = req.user;

    if (!receiverPhone || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const receiver = await User.findOne({ where: { phone: receiverPhone } });
    if (!receiver) return res.status(404).json({ error: 'Receiver not found' });
    if (receiver.id === sender.id) return res.status(400).json({ error: 'Cannot transfer to yourself' });

    const senderWallet = await Wallet.findOne({ where: { UserId: sender.id } });
    const receiverWallet = await Wallet.findOne({ where: { UserId: receiver.id } });

    const sendBalance = parseFloat(senderWallet.balance);
    const transferAmount = parseFloat(amount);
    if (sendBalance < transferAmount) return res.status(400).json({ error: 'Insufficient funds' });

    const senderNewBalance = sendBalance - transferAmount;
    const receiverNewBalance = parseFloat(receiverWallet.balance) + transferAmount;

    await senderWallet.update({ balance: senderNewBalance }, { transaction: t });
    await receiverWallet.update({ balance: receiverNewBalance }, { transaction: t });

    await Transaction.create({
      WalletId: senderWallet.id,
      type: 'debit',
      amount: transferAmount,
      description: description || `Transfer to ${receiver.phone}`,
      balanceBefore: sendBalance,
      balanceAfter: senderNewBalance
    }, { transaction: t });

    await Transaction.create({
      WalletId: receiverWallet.id,
      type: 'credit',
      amount: transferAmount,
      description: description || `Received from ${sender.phone}`,
      balanceBefore: parseFloat(receiverWallet.balance),
      balanceAfter: receiverNewBalance
    }, { transaction: t });

    await t.commit();

    // Send notifications (real services)
    await notifier.sendEmail(sender.email, 'Debit Alert', `You sent ₦${amount} to ${receiver.phone}`);
    await notifier.sendEmail(receiver.email, 'Credit Alert', `You received ₦${amount} from ${sender.phone}`);
    await notifier.sendSMS(sender.phone, `You sent ₦${amount} to ${receiver.phone}`);
    await notifier.sendSMS(receiver.phone, `You received ₦${amount} from ${sender.phone}`);

    res.json({ message: 'Transfer successful' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const wallet = await Wallet.findOne({ where: { UserId: req.user.id } });
    const transaction = await Transaction.findOne({ where: { id, WalletId: wallet.id } });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFilteredTransactions = async (req, res) => {
  try {
    const { type, billType, service } = req.query;
    const wallet = await Wallet.findOne({ where: { UserId: req.user.id } });
    const where = { WalletId: wallet.id };

    if (type) where.type = type;
    if (billType) where.description = { [Op.iLike]: `%${billType}%` };
    if (service) where.description = { [Op.iLike]: `%${service}%` };

    const transactions = await Transaction.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
