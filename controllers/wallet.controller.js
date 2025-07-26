const { Wallet, Transaction, PaymentIntent, User, Address } = require('../models');
const remita = require('../utils/remita');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { fundBankoneAccount, withdrawFromBankoneAccount, intraBankTransfer, transferLocalBank, createBankOneCustomerAndAccount } = require('../utils/bankOne');
const { checkCreditScore } = require('../utils/dojah');
const BANKONE_BASE_URL = process.env.BANKONE_BASE_URL;
const BANKONE_AUTHTOKEN = process.env.BANKONE_AUTHTOKEN;
const BANKONE_PRODUCT_CODE = process.env.BANKONE_PRODUCT_CODE;
const AccountOfficerCode = process.env.ACCOUNT_OFFICER_CODE || 'default-officer';

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

exports.createCustomer = async (req, res) => {
  const user = req.user;
  try {
    // Check if user already has a BankOne account
    if (user.bankoneCustomerId) {
      return res.status(400).json({ error: 'BankOne account already exists' });
    }
    const creditScore = await checkCreditScore(user.bvn); 
    const HasCurrentRunningLoanAnddNottDefaultingg = creditScore?.data.entity.totalNoOfActiveLoans.value === 1 && creditScore?.data.entity.totalOverdue.value === 0
    const HasDefaultedInAnyLoan = creditScore?.data.entity.totalNoOfOverdueAccounts.value === 1

    // Front end should provide this Interface to collect these details
    const{ refferalName, refferalPhoneNo, email, NextOfKinName, NextOfKinPhoneNo } = req.body; 
    const HasNoOutStandingLoanAndNotDefaulting = creditScore?.data.entity.totalOutstanding.value === 0 && creditScore?.data.entity.totalOverdue.value === 0;
    const payload = {
      LastName: user.last_name,
      FirstName: user.first_name,
      OtherNames: user.middle_name || '',
      City: user.enrollmentBranch || 'Unknown',
      Address: user.residential_address || 'Unknown',
      Gender: user.gender,
      DateOfBirth: user.date_of_birth,
      PhoneNo: user.phone_number1,
      PlaceOfBirth: user.state_of_origin || 'Unknown',
      NationalIdentityNo: user.national_identity_number || '',
      NextOfKinName: user.next_of_kin_name || NextOfKinName || '',
      NextOfKinPhoneNo: user.next_of_kin_phone_number || NextOfKinPhoneNo || '',
      RefferalName: refferalName,
      RefferalPhoneNo: refferalPhoneNo,
      CustomerType: 'Individual',
      BranchID: user.enrollmentBank || 'Unknown',
      BankVerificationNumber: user.bvn,
      Email: email,
      HasCurrentRunningLoanAnddNottDefaultingg,
      HasDefaultedInAnyLoan,
      HasNoOutStandingLoanAndNotDefaulting,
      HasCompleteDocumentation: false,
      HasSufficientInfoOnAccountInfo: true,
      customerPassportInBytes: "",
      AccountOfficerCode
    };
    // Create customer in BankOne
    const response = await axios.post(
      `http://staging.mybankone.com/BankOneWebAPI/api/Customer/CreateCustomer/2?authToken=${BANKONE_AUTHTOKEN}`,
      payload,
    );
    const data = response.data;
    if (!data.IsSuccessful) {
      return res.status(400).json({ error: 'BankOne account creation failed', details: data.Description });
    } 
    // Save customer ID and account number to user
    await user.update({
      bankoneCustomerId: data.Payload.CustomerID,
      bankoneAccountNumber: data.Payload.AccountNumber,
      bankoneFullName: data.Payload.FullName,
    });
    res.status(201).json({
      message: 'BankOne account created successfully',
      bankone: {
        customerId: data.Payload.CustomerID,
        accountNumber: data.Payload.AccountNumber,
        fullName: data.Payload.FullName
      }
    });
  } catch (err) {
    console.error('Create customer error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to create BankOne account', details: err.message });
  }
};

exports.updateBankoneCustomer = async (req, res) => {
  const customerId = req.user.bankoneCustomerId;
  const data = req.body
  if (!customerId) {
    return res.status(404).json({ error: 'BankOne customer not found' });
  }
  const payload = {
    customerID: customerId,
    BankVerificationNumber: req.user.bvn,
    EmailNotification: true,
    PhoneNotification: true,
    ...data 
  };
  try {
    const response = await axios.post(
      `http://staging.mybankone.com/BankOneWebAPI/api/Customer/UpdateCustomer/2?authToken=${BANKONE_AUTHTOKEN}`,
      payload
    );
    const result = response.data;
    if (!result.IsSuccessful) {
      return res.status(400).json({ error: 'Failed to update BankOne customer', details: result.Description });
    }
    // Update user details in local DB
    return res.status(200).json({
      message: 'BankOne customer updated successfully',
      customer: {
        customerId: result.Payload.CustomerID,
        accountNumber: result.Payload.AccountNumber,
        fullName: result.Payload.FullName
      }
    });
  } catch (err) {
    console.error('Update customer error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to update BankOne customer', details: err.message });
  }
};


exports.getBankoneCustomer = async (req, res) => {
  const customerId = req.user.bankoneCustomerId;
  if (!customerId) {
    return res.status(404).json({ error: 'BankOne customer not found' });
  }
  try {
    const accountNumber = req.user.bankoneAccountNumber || '';
    const response = await axios.get(
      `http://staging.mybankone.com/BankOneWebAPI/api/Customer/GetByAccountNo/2?accountNumber=${accountNumber}&authToken=${BANKONE_AUTHTOKEN}`,
    );
    const data = response.data;
    if (!data.IsSuccessful) {
      return res.status(400).json({ error: 'Failed to fetch BankOne customer', details: data.Description });
    }
    res.status(200).json({
      customer: {
        customerId: data.Payload.CustomerID,
        accountNumber: data.Payload.AccountNumber,
        fullName: data.Payload.FullName,
        email: data.Payload.Email,
        phoneNumber: data.Payload.PhoneNo,
        address: data.Payload.Address,
        dateOfBirth: data.Payload.DateOfBirth,
      }
    });
  } catch (err) {
    console.error('Get customer error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to retrieve BankOne customer', details: err.message });
  }
};

// ✅ Create Wallet and BankOne Account
exports.createWallet = async (req, res) => {
  
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) throw new Error('User not found');
    

    const payload =  {
      id: user.id,
      bvn: user.bvn,
      first_name: user.firstName,
      last_name: user.lastName,
      middle_name: user.middleName,
      phone_number1: user.phoneNumber1,
      state_of_origin: user.stateOfOrigin,
      gender: user.gender,
      date_of_birth: user.dateOfBirth,
      residential_address: user.residentialAddress,
      nin: user.nin,
      email: user.email
    };

    const createCustomerResponse = await createBankOneCustomerAndAccount(payload);

    return res.status(200).json({
      status: 200,
      data: createCustomerResponse
    });
    
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
      `https://staging.mybankone.com/thirdpartyapiservice/apiservice/Account/AccountEnquiry`,
      {
        AccountNumber: user.bankoneAccountNumber,
        AuthenticationCode: BANKONE_AUTHTOKEN
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
    res.status(200).json({ message: 'Account funded', reference: result.Payload?.RetrievalReference });
  } catch (err) {
    res.status(500).json({ error: 'Funding failed', details: err.message });
  }
};

exports.intraBankTransfer = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user?.bankoneAccountNumber) return res.status(400).json({ error: 'No BankOne account found' });
  try {
    const result = await intraBankTransfer(req.body);
    if (!result.IsSuccessful) throw new Error(result.Description);
    res.status(200).json({ message: 'Transfer successful', reference: result.Payload?.TransactionRef });
  } catch (err) {
    res.status(500).json({ error: 'Transfer failed', details: err.message });
  }
}

exports.reverseTransfer = async (req, res) => {
  const { RetrievalReference, TransactionDate, TransactionType, Amount } = req.body;
  if (!RetrievalReference || !TransactionDate || !TransactionType || !Amount) {
    return res.status(400).json({ error: 'Retrieval reference, transaction date, transaction type and amount are required' });
  }

  try {
    const result = await reverseTransfer(req.body);
    if (result.status !== 200) throw new Error(result.error || 'Reversal failed');
    res.status(200).json({ message: 'Transfer reversed successfully', reference: result.Payload?.TransactionRef });
  } catch (err) {
    res.status(500).json({ error: 'Reversal failed', details: err.message });
  }
}


exports.transferLocalBank = async (req, res) => {
  const { amount, description, recipientAccountNumber, recipientBankCode } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!user?.bankoneAccountNumber) return res.status(400).json({ error: 'No BankOne account found' });

  try {
    const result = await transferLocalBank(req.body);
    if (!result.IsSuccessful) throw new Error(result.Description);
    res.status(200).json({ message: 'Transfer successful', reference: result.Payload?.TransactionRef });
  } catch (err) {
    res.status(500).json({ error: 'Transfer failed', details: err.message });
  }
}
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

