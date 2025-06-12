const { PaymentIntent } = require('../models');
const remita = require('../utils/remita');

exports.retryPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const intent = await PaymentIntent.findOne({ where: { reference, UserId: req.user.id } });

    if (!intent) return res.status(404).json({ error: 'PaymentIntent not found' });
    if (intent.status !== 'failed') return res.status(400).json({ error: 'Only failed payments can be retried' });

    const newReference = reference + '-retry';
    const remitaPayment = await remita.initiatePayment({
      amount: intent.metadata.amount,
      description: `Retry for loan repayment (Ref: ${reference})`,
      reference: newReference,
      user: req.user
    });

    await intent.update({ reference: newReference, status: 'pending' });

    res.status(200).json({ message: 'Retry initiated', payment: remitaPayment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};