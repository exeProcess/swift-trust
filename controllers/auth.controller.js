const { User, Pin, Wallet, BankAccount, Transaction } = require('../models');
const jwt = require('../utils/jwt');
const bcrypt = require('bcrypt');
const dojah = require('../utils/dojah');
const notifier = require('../utils/notifier');
const paymentIntentModel = require('../models/paymentIntent.model');

// exports.register = async (req, res) => {
//   try {
//     const { bvn, referral } = req.body;

//     if (!bvn) {
//       return res.status(400).json({ error: 'BVN is required' });
//     }

//     // Check if user already exists
//     const existing = await User.findOne({ where: { bvn } });
//     if (existing) {
//       return res.status(400).json({ error: 'BVN already registered' });
//     }

//     // Verify BVN with Dojah
//     const result = await dojah.verifyBVN(bvn);
//     if (!result || !result.entity) {
//       return res.status(400).json({ error: 'Invalid BVN' });
//     }

//     const entity = result.entity;
//     const {
//       first_name,
//       last_name,
//       middle_name,
//       gender,
//       date_of_birth,
//       phone_number1,
//       phone_number2,
//       image,
//       email,
//       enrollment_bank,
//       enrollment_branch,
//       level_of_account,
//       lga_of_origin,
//       lga_of_residence,
//       marital_status,
//       name_on_card,
//       nationality,
//       registration_date,
//       residential_address,
//       state_of_origin,
//       state_of_residence,
//       title,
//       watch_listed
//     } = entity;

//     if (!first_name || !last_name || !phone_number1) {
//       return res.status(400).json({ error: 'BVN verification failed, missing essential user details' });
//     }

//     // Create user
//     const user = await User.create({
//       bvn,
//       first_name,
//       last_name,
//       middle_name,
//       gender,
//       date_of_birth,
//       phone_number1,
//       phone_number2,
//       image,
//       email,
//       enrollment_bank,
//       enrollment_branch,
//       level_of_account,
//       lga_of_origin,
//       lga_of_residence,
//       marital_status,
//       name_on_card,
//       nationality,
//       registration_date,
//       residential_address,
//       state_of_origin,
//       state_of_residence,
//       title,
//       watch_listed
//     });
//     const id = user.id;
//     await Wallet.create({
//       userId: id
//     });
//     const token = jwt.generateToken(user); // assumes `generateToken(user)` returns a JWT
//     res.status(201).json({ token, user:{ first_name, last_name, bvn, phone_number1} });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// };

exports.kycBVN = async (req, res) => {
   try {
    const { bvn } = req.body;
    const result = await dojah.kycBVNAdvance(bvn);
    return result;
   } catch (error) {
    res.status(500).json({ error: 'Something went wrong', details: err.message });
   }
}

exports.register = async (req, res) => {
  try {
    const { bvn, referral } = req.body;

    if (!bvn) {
      return res.status(400).json({ error: 'BVN is required' });
    }

    // Check if user already exists
    const existing = await User.findOne({ where: { bvn } });
    if (existing) {
      return res.status(400).json({ error: 'BVN already registered' });
    }

    // Verify BVN with Dojah
    const result = await dojah.kycBVNFull(bvn);
    if (!result || !result.entity) {
      return res.status(400).json({ error: 'Invalid BVN' });
    }

    const entity = result.entity;
    const firstName = entity.first_name;
    const lastName = entity.last_name;
    const middleName = entity.middle_name
    const gender = entity.gender;
    const phoneNumber1 = entity.phone_number1;
    const dateOfBirth = entity.date_of_birth;
    const image = entity.image;

    if (firstName === "" || lastName === "" || phoneNumber1 === "") {
      return res.status(400).json({ error: 'BVN verification failed, missing essential user details' });
    }

    // // Create user
    const user = await User.create({
      bvn,
      firstName,
      lastName,
      middleName,
      gender,
      dateOfBirth,
      phoneNumber1,
      image
    });

    const id = user.id;
    await Wallet.create({ userId: id });

    // --- CREATE CUSTOMER & ACCOUNT ON BANKONE ---
    // const bankoneRes = await axios.post(
    //   `${process.env.BANKONE_BASE_URL}/CreateCustomerAndAccount/2`,
    //   {
    //     TransactionTrackingRef: `trx-${Date.now()}-${id}`,
    //     AccountOpeningTrackingRef: `acct-${Date.now()}-${id}`,
    //     ProductCode: process.env.BANKONE_PRODUCT_CODE,
    //     LastName: last_name,
    //     OtherNames: first_name + (middle_name ? ' ' + middle_name : ''),
    //     BVN: bvn,
    //     PhoneNo: phone_number1,
    //     PlaceOfBirth: state_of_origin || 'Unknown',
    //     Gender: gender?.startsWith('m') ? 'M' : 'F',
    //     DateOfBirth: date_of_birth,
    //     Address: residential_address || 'Unknown',
    //     NationalIdentityNo: '',
    //     Email: email,
    //     HasSufficientInfoOnAccountInfo: true
    //   },
    //   {
    //     params: { authtoken: process.env.BANKONE_AUTHTOKEN, version: '2' }
    //   }
    // );

    // const bankoneData = bankoneRes.data;
    // if (!bankoneData.IsSuccessful) {
    //   console.warn('BankOne account creation failed:', bankoneData.Description);
    //   // optionally: store this result for retrying later
    // } else {
    //   // Optional: Save BankOne CustomerID & AccountNumber in DB
    //   await user.update({
    //     bankoneCustomerId: bankoneData.Payload.CustomerID,
    //     bankoneAccountNumber: bankoneData.Payload.AccountNumber
    //   });
    // }

    const token = jwt.generateToken(user);
    return res.status(201).json({
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err.result?.data || err.message);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
};


exports.verifySelfieWithPhotoId = async (req, res) => {
  const user = req.user;  
  try {
    const {
      selfie_image,
    } = req.body;

    const photoid_image = user.image; 
    const first_name = user.firstName; 
    const last_name = user.lastname;

    const payload = {
      selfie_image,
      photoid_image,
      first_name,
      last_name
    };

    // Validate input
    if (!selfie_image) {
      return res.status(400).json({ error: 'Selfie image is required' });
    }


    // Call Dojah API
    const result = await dojah.verifySelfieWithPhotoId(
      payload
    );
    // Check for errors in result
    if (!result || !result.data.entity) {
      return res.status(400).json({ error: 'Invalid result from Dojah API' });
    }
    
    
    if (result.entity.selfie.confidence_value < 90) {
      return res.status(400).json({ error: 'Selfie verification confidence too low', details: result.entity });
    }else{
      return res.status(200).json(result.entity);
    }
    // if (result.data.entity.selfie.match && result.data.entity.selfie.confidence_value >= 0.5) {
    //   user.isVerified = true; 
    //   await user.save(); 
    //   const sendOtpresult = await notifier.sendSMS(user.phone_number1);
    //   if (sendOtpresult.status === 'error') {
    //     return res.status(500).json({ error: 'Failed to send OTP', details: sendOtpresult.message });
    //   }else {
    //     return res.status(200).json({
    //       message: 'Selfie and photo ID verification successful',
    //       otp_sent: true
    //     });
    //   }
    // }
    
  } catch (err) {
    // console.error('Dojah API error:', err.result?.data || err.message);
    res.status(500).json({
      error: 'Failed to verify selfie and photo ID',
      details: err.result?.data || err.message
    });
  }
};


exports.setPin = async (req, res) => {
  const user = req.user;
  try {
    const { pin } = req.body;
    const hashed = await bcrypt.hash(pin, 10);
    const saved = await Pin.create({ hashedPin: hashed, UserId: user.id });
    res.status(201).json({ message: 'PIN created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { phone, pin } = req.body;
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const pinRecord = await Pin.findOne({ where: { UserId: user.id } });
    if (!pinRecord) {
      return res.status(404).json({ error: 'PIN not set' });
    }
    const isMatch = await bcrypt.compare(pin, pinRecord.hashedPin);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }
    const token = jwt.generateToken(user);
    res.status(200).json({ token });
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}
exports.getUser = async (req, res) => {
  const authUser = req.user; // from token middleware

  try {
    const user = await User.findByPk(authUser.id, {
      include: [
        { model: Profile },       // assuming Profile has userId foreign key
        { model: Wallet },
        { model: Transaction },
        {model: BankAccount},
        {model: PaymentIntentModel},
        {model: Transaction},
        {model: Wallet}   // adjust these based on your models
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

