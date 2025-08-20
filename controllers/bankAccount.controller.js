const { BankAccount, User, Nok  } = require('../models');
const bankOne = require('../utils/bankOne');

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
      userId: req.user.id
    });
    res.status(201).json({ bank, resolved: verify.data });
  } catch (err) {
    res.status(400).json({ error: err.response?.data || err.message });
  }
};

exports.createBankOneCustomerAndAccount = async (req, res) => {;
  // const userId = req.user.id;
  try {
    // const user = await User.findByPk(userId);
    // const nextOfKin = await Nok.findOne({where: userId});
    // if (!user) {
    //   return res.status(404).json({ error: 'User not found' });
    // }
    // const id = user.id;
    // const bvn = user.bvn;
    // const first_name = user.firstName;
    // const last_name = user.lastName;
    // const middle_name = user.middleName || '';  
    // const phone_number1 = user.phoneNumber1 || ''; 
    // const state_of_origin = user.stateOfOrigin || '';
    // const gender = user.gender; 
    // const date_of_birth = user.dateOfBirth || '';
    // const residential_address = user.residentialAddress || '';
    // const nextOfKinName = "";
    // const nextOfKinPhoneNumber = "";
    // const nin = user.nin || '';
    // const email = user.email || '';

    // const customerAndAccontCreationRequestPayload = {
    //   id,
    //   first_name,
    //   last_name,
    //   middle_name,
    //   phone_number1,
    //   state_of_origin,
    //   nin,
    //   bvn,
    //   email,
    //   residential_address,
    //   gender,
    //   nextOfKinName,
    //   nextOfKinPhoneNumber,
    //   date_of_birth,
    // }
    const bankOneCustomerAndAccountCreationResponse = await bankOne.createBankOneCustomerAndAccount();

    return res.status(200).json(bankOneCustomerAndAccountCreationResponse);    
  } catch (err) {
    console.error('Error creating Bank One customer and account:', err);
    return res.status(500).json({error: err.message});
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