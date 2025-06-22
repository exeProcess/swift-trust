
const { User, Wallet, Transaction, Loan, sequelize, PaymentIntent } = require('../models');
const { requestLoan, getLoanDetails, getCustomerLoans, repayLoan } = require('../utils/loanService');
const { Op } = require('sequelize');
const remita = require('../utils/remita');
const { v4: uuidv4 } = require('uuid');
exports.initiateCardRepayment = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { amount } = req.body;
    const userId = req.user.id;

    const loan = await Loan.findOne({ where: { id: loanId, UserId: userId } });
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    if (loan.status === 'paid') return res.status(400).json({ error: 'Loan already repaid' });

    const reference = uuidv4();
    await PaymentIntent.create({
      reference,
      UserId: userId,
      type: 'loan-repayment',
      status: 'pending',
      metadata: { loanId, amount }
    });

    const remitaPayment = await remita.initiatePayment({
      amount,
      description: `Loan repayment via card for Loan ID ${loanId}`,
      reference,
      user: req.user
    });

    res.status(201).json({ message: 'Payment initiated', payment: remitaPayment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// exports.repayLoan = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { loanId } = req.params;
//     const { amount } = req.body;
//     const userId = req.user.id;

//     const loan = await Loan.findOne({ where: { id: loanId, UserId: userId } });
//     if (!loan) return res.status(404).json({ error: 'Loan not found' });
//     if (loan.status === 'paid') return res.status(400).json({ error: 'Loan already repaid' });

//     const repaymentAmount = parseFloat(amount);
//     const wallet = await Wallet.findOne({ where: { UserId: userId } });
//     const walletBalance = parseFloat(wallet.balance);

//     if (walletBalance < repaymentAmount) {
//       return res.status(400).json({ error: 'Insufficient wallet balance' });
//     }

//     const newWalletBalance = walletBalance - repaymentAmount;
//     const newLoanBalance = parseFloat(loan.balance) - repaymentAmount;

//     await wallet.update({ balance: newWalletBalance }, { transaction: t });
//     await loan.update({ balance: newLoanBalance <= 0 ? 0 : newLoanBalance }, { transaction: t });

//     if (newLoanBalance <= 0) await loan.update({ status: 'paid' }, { transaction: t });
    

//     await Transaction.create({
//       WalletId: wallet.id,
//       type: 'debit',
//       amount: repaymentAmount,
//       description: `Loan repayment for loan ID: ${loanId}`,
//       balanceBefore: walletBalance,
//       balanceAfter: newWalletBalance
//     }, { transaction: t });

//     await t.commit();
//     res.json({ message: 'Loan repayment successful', loanStatus: loan.status });
//   } catch (err) {
//     await t.rollback();
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.applyLoan = async (req, res) => {
//   try {
//     const { amount, type, tenor } = req.body;
//     const loan = await Loan.create({
//       amount,
//       type,
//       tenor,
//       UserId: req.user.id
//     });
//     res.status(201).json(loan);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

exports.getLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll({ where: { UserId: req.user.id } });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveLoan = async (req, res) => {
  try {
    const { loanId } = req.body;
    const loan = await Loan.findByPk(loanId);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    loan.status = 'approved';
    await loan.save();
    res.json({ message: 'Loan approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.disburseLoan = async (req, res) => {
  try {
    const { loanId } = req.body;
    const loan = await Loan.findByPk(loanId);
    if (!loan || loan.status !== 'approved') return res.status(400).json({ error: 'Loan not approved' });

    const wallet = await Wallet.findOne({ where: { UserId: loan.UserId } });
    const amount = parseFloat(loan.amount);
    const balanceBefore = parseFloat(wallet.balance);
    const newBalance = balanceBefore + amount;

    await wallet.update({ balance: newBalance });
    await Transaction.create({
      WalletId: wallet.id,
      type: 'credit',
      amount,
      description: 'Loan disbursement',
      balanceBefore,
      balanceAfter: newBalance
    });

    await remita.disburseToBank({ amount, userId: loan.UserId }); // mock call

    loan.status = 'disbursed';
    loan.dueDate = new Date(Date.now() + loan.tenor * 24 * 60 * 60 * 1000);
    await loan.save();

    res.json({ message: 'Loan disbursed', loan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.repayLoan = async (req, res) => {
//   try {
//     const { loanId } = req.body;
//     const loan = await Loan.findByPk(loanId);
//     const wallet = await Wallet.findOne({ where: { UserId: req.user.id } });

//     if (!loan || loan.UserId !== req.user.id || loan.status !== 'disbursed') {
//       return res.status(400).json({ error: 'Invalid loan' });
//     }

//     const amount = parseFloat(loan.amount) * (1 + loan.interestRate / 100);
//     const balanceBefore = parseFloat(wallet.balance);

//     if (balanceBefore < amount) return res.status(400).json({ error: 'Insufficient balance' });

//     const newBalance = balanceBefore - amount;
//     await wallet.update({ balance: newBalance });

//     await Transaction.create({
//       WalletId: wallet.id,
//       type: 'debit',
//       amount,
//       description: 'Loan repayment',
//       balanceBefore,
//       balanceAfter: newBalance
//     });

//     loan.status = 'repaid';
//     await loan.save();

//     res.json({ message: 'Loan repaid' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


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

