const { PaymentIntent, Loan, Wallet, Transaction, sequelize } = require('../models');
const remita = require('../utils/remita');
const { Withdrawal } = require('../models');


exports.handleRemitaCardWebhook = async (req, res) => {
  try {
    const { reference, status } = req.body; // Validate signature in production

    const intent = await PaymentIntent.findOne({ where: { reference } });
    if (!intent || intent.status === 'success') return res.sendStatus(200);

    if (status === 'success' && intent.type === 'loan-repayment') {
      const { loanId, amount } = intent.metadata;
      const loan = await Loan.findByPk(loanId);

      if (loan) {
        const newBalance = parseFloat(loan.balance) - parseFloat(amount);
        await loan.update({
          balance: newBalance <= 0 ? 0 : newBalance,
          status: newBalance <= 0 ? 'paid' : 'active'
        });

        await Transaction.create({
          WalletId: null,
          type: 'loan-repayment',
          amount,
          description: `Loan repayment via card (Ref: ${reference})`,
          balanceBefore: null,
          balanceAfter: null
        });
      }

      await intent.update({ status: 'success' });
    } else {
      await intent.update({ status });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.handleRemitaWithdrawalStatus = async (req, res) => {
  try {
    const { reference, status } = req.body; // Expected payload
    const withdrawal = await Withdrawal.findOne({ where: { reference } });
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });

    await withdrawal.update({ status });
    res.json({ message: 'Withdrawal status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.handleRemitaWebhook = async (req, res) => {
  try {
    if (!remita.verifyWebhookSignature(req)) {
      return res.status(403).json({ error: 'Invalid webhook signature' });
    }

    const { reference, amount } = req.body;
    const intent = await PaymentIntent.findOne({ where: { reference } });
    if (!intent) return res.status(404).json({ error: 'Payment intent not found' });

    const user = await User.findByPk(intent.UserId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const wallet = await Wallet.findOne({ where: { UserId: user.id } });
    const balanceBefore = parseFloat(wallet.balance);
    const newBalance = balanceBefore + parseFloat(amount);

    await wallet.update({ balance: newBalance });
    await Transaction.create({
      WalletId: wallet.id,
      type: 'credit',
      amount,
      description: `Remita payment ref: ${reference}`,
      balanceBefore,
      balanceAfter: newBalance
    });
    await intent.update({ status: 'success' });

    res.json({ message: 'Wallet credited successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};