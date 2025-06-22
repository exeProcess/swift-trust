const { Wallet, Transaction, PaymentIntent, User } = require('../models');
const remita = require('../utils/remita');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { fundBankoneAccount, withdrawFromBankoneAccount } = require('../utils/bankOne');


const BANKONE_BASE_URL = process.env.BANKONE_BASE_URL;
const BANKONE_AUTHTOKEN = process.env.BANKONE_AUTHTOKEN;
const BANKONE_PRODUCT_CODE = process.env.BANKONE_PRODUCT_CODE;

exports.getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ where: { UserId: req.user.id } });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.initiateFunding = async (req, res) => {
  try {
    const { amount } = req.body;
    const reference = uuidv4();
    await PaymentIntent.create({ reference, amount, UserId: req.user.id });
    const payment = await remita.initiatePayment(req.user.id, amount, req.user.email, reference);
    res.json({ message: 'Payment initiated', reference, payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Create Wallet and BankOne Account
exports.createWallet = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Create wallet in local DB
    const wallet = await Wallet.create({ UserId: req.user.id });

    // Create account in BankOne
    const bankoneRes = await axios.post(
      `${BANKONE_BASE_URL}/CreateCustomerAndAccount/2`,
      {
        TransactionTrackingRef: `trx-${Date.now()}-${user.id}`,
        AccountOpeningTrackingRef: `acct-${Date.now()}-${user.id}`,
        ProductCode: BANKONE_PRODUCT_CODE,
        LastName: user.last_name,
        OtherNames: user.first_name + (user.middle_name ? ' ' + user.middle_name : ''),
        BVN: user.bvn,
        PhoneNo: user.phone_number1,
        PlaceOfBirth: user.state_of_origin || 'Unknown',
        Gender: user.gender?.startsWith('m') ? 'M' : 'F',
        DateOfBirth: user.date_of_birth,
        Address: user.residential_address || 'Unknown',
        NationalIdentityNo: '',
        Email: user.email,
        HasSufficientInfoOnAccountInfo: true
      },
      {
        params: { authtoken: BANKONE_AUTHTOKEN, version: '2' }
      }
    );

    const data = bankoneRes.data;
    if (!data.IsSuccessful) {
      return res.status(400).json({ error: 'BankOne account creation failed', details: data.Description });
    }

    // Save account info to user
    await user.update({
      bankoneCustomerId: data.Payload.CustomerID,
      bankoneAccountNumber: data.Payload.AccountNumber
    });

    res.status(201).json({
      message: 'Wallet and BankOne account created',
      wallet,
      bankone: {
        accountNumber: data.Payload.AccountNumber,
        customerId: data.Payload.CustomerID,
        fullName: data.Payload.FullName
      }
    });
  } catch (err) {
    console.error('Create wallet error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to create wallet/account', details: err.message });
  }
};

// ✅ Get BankOne Account Details by Account Number
exports.getBankoneAccountDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || !user.bankoneAccountNumber) {
      return res.status(404).json({ error: 'BankOne account info not available' });
    }

    const response = await axios.get(
      `${BANKONE_BASE_URL}/GetAccountDetailsByAccountNumber/2`,
      {
        params: {
          accountNumber: user.bankoneAccountNumber,
          authtoken: BANKONE_AUTHTOKEN,
          version: '2'
        }
      }
    );

    const data = response.data;
    if (!data.IsSuccessful) {
      return res.status(400).json({ error: 'Failed to fetch account details', details: data.Description });
    }

    res.status(200).json({
      account: data.Payload
    });
  } catch (err) {
    console.error('BankOne account fetch error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Unable to retrieve account info', details: err.message });
  }
};
// ✅ Fund Wallet
exports.fundBankone = async (req, res) => {
  const { amount, description } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!user?.bankoneAccountNumber) return res.status(400).json({ error: 'No BankOne account found' });

  try {
    const result = await fundBankoneAccount(user.bankoneAccountNumber, amount, description);
    if (!result.IsSuccessful) throw new Error(result.Description);
    res.status(200).json({ message: 'Account funded', reference: result.Payload?.TransactionRef });
  } catch (err) {
    res.status(500).json({ error: 'Funding failed', details: err.message });
  }
};

exports.withdrawBankone = async (req, res) => {
  const { amount, description } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!user?.bankoneAccountNumber) return res.status(400).json({ error: 'No BankOne account found' });

  try {
    const result = await withdrawFromBankoneAccount(user.bankoneAccountNumber, amount, description);
    if (!result.IsSuccessful) throw new Error(result.Description);
    res.status(200).json({ message: 'Withdrawal successful', reference: result.Payload?.TransactionRef });
  } catch (err) {
    res.status(500).json({ error: 'Withdrawal failed', details: err.message });
  }
};

