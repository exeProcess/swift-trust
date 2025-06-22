const { User, Pin, Wallet } = require('../models');
const jwt = require('../utils/jwt');
const bcrypt = require('bcrypt');
const dojah = require('../utils/dojah');
const notifier = require('../utils/notifier');

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
//     const response = await dojah.verifyBVN(bvn);
//     if (!response || !response.entity) {
//       return res.status(400).json({ error: 'Invalid BVN' });
//     }

//     const entity = response.entity;
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
    const result = await dojah.kycBVN(bvn);
    // return res.status(200).json(result);
    if (!response || !response.data || !response.data.entity) {
      return res.status(400).json({ error: 'Invalid BVN' });
    }

    const entity = result.data;
    // const {
    //   first_name,
    //   last_name,
    //   middle_name,
    //   gender,
    //   date_of_birth,
    //   phone_number1,
    //   phone_number2,
    //   image,
    //   email,
    //   enrollment_bank,
    //   enrollment_branch,
    //   level_of_account,
    //   lga_of_origin,
    //   lga_of_residence,
    //   marital_status,
    //   name_on_card,
    //   nationality,
    //   registration_date,
    //   residential_address,
    //   state_of_origin,
    //   state_of_residence,
    //   title,
    //   watch_listed
    // } = entity;
    return res.status(200).json({
      result: entity,
    });

    // if (!first_name || !last_name || !phone_number1) {
    //   return res.status(400).json({ error: 'BVN verification failed, missing essential user details' });
    // }

    // // Create user
    // const user = await User.create({
    //   bvn,
    //   first_name,
    //   last_name,
    //   middle_name,
    //   gender,
    //   date_of_birth,
    //   phone_number1,
    //   phone_number2,
    //   image,
    //   email,
    //   enrollment_bank,
    //   enrollment_branch,
    //   level_of_account,
    //   lga_of_origin,
    //   lga_of_residence,
    //   marital_status,
    //   name_on_card,
    //   nationality,
    //   registration_date,
    //   residential_address,
    //   state_of_origin,
    //   state_of_residence,
    //   title,
    //   watch_listed
    // });

    // const id = user.id;
    // await Wallet.create({ userId: id });

    // // --- CREATE CUSTOMER & ACCOUNT ON BANKONE ---
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

    //const token = jwt.generateToken(user);
    // return res.status(201).json({
    //   response: response.data
    // });
    // res.status(201).json({
    //   token,
    //   user: {
    //     first_name,
    //     last_name,
    //     bvn,
    //     phone_number1,
    //     // bankoneCustomerId: bankoneData.Payload?.CustomerID || null,
    //     // bankoneAccountNumber: bankoneData.Payload?.AccountNumber || null
    //   }
    // });
    // res.status(201).json({
    //   token,
    //   user: {
    //     first_name,
    //     last_name,
    //     bvn,
    //     phone_number1,
    //     bankoneCustomerId: bankoneData.Payload?.CustomerID || null,
    //     bankoneAccountNumber: bankoneData.Payload?.AccountNumber || null
    //   }
    // });
  } catch (err) {
    console.error('Registration error:', err.response?.data || err.message);
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
    const first_name = user.first_name; 
    const last_name = user.last_name;

    // Validate input
    if (!selfie_image) {
      return res.status(400).json({ error: 'Selfie image is required' });
    }


    // Call Dojah API
    const response = await dojah.verifySelfieWithPhotoId(
      selfie_image,
      photoid_image,
      first_name,
      last_name
    );
    // Check for errors in response
    if (!response || !response.data || !response.data.entity || !response.data.entity.selfie) {
      return res.status(400).json({ error: 'Invalid response from Dojah API' });
    }
    if (response.data.status !== 'success') {
      return res.status(400).json({ error: 'Selfie verification failed', details: response.data });
    }
    if (!response.data.entity.selfie) {
      return res.status(400).json({ error: 'Selfie verification result not found' });
    }
    
    if (!response.data.entity.selfie.match || response.data.entity.selfie.confidence_value < 0.5) {
      return res.status(400).json({ error: 'Selfie verification confidence too low', details: response.data });
    }
    if (response.data.entity.selfie.match && response.data.entity.selfie.confidence_value >= 0.5) {
      user.isVerified = true; 
      await user.save(); 
      const sendOtpResponse = await notifier.sendSMS(user.phone_number1);
      if (sendOtpResponse.status === 'error') {
        return res.status(500).json({ error: 'Failed to send OTP', details: sendOtpResponse.message });
      }else {
        return res.status(200).json({
          message: 'Selfie and photo ID verification successful',
          otp_sent: true
        });
      }
    }
    
  } catch (err) {
    console.error('Dojah API error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to verify selfie and photo ID',
      details: err.response?.data || err.message
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
  const user = req.user;
  try {
    const user = await User.findByPk(user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

