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

exports.kycNIN = async (req, res) => {
  try {
    const { nin } = req.body;
    const result = await verifyNIN(nin);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'NN verification failed', details: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { bvn, nin, referral } = req.body;

    if (!bvn) {
      return res.status(400).json({ error: 'BVN is required' });
    }

    // Check if user already exists
    const existing = await User.findOne({ where: { bvn } });
    if (existing) {
      return res.status(400).json({ error: 'BVN already registered' });
    }

    // Verify BVN with Dojah
    const verifyBVN = await dojah.kycBVNAdvance(bvn);
    const verifyNIN = await dojah.verifyNIN(nin);

    if (!verifyBVN) {
      return res.status(400).json({ error: 'Invalid BVN' });
    }

    if(!verifyNIN){
      return res.status(400).json({ error: "Invalid NIN"});
    }
    
    if(verifyBVN.entity.date_of_birth !== verifyNIN.entity.date_of_birth){
      return res.status(400).json({status: 400, message: "Error validating user's NIN and BVN"});
    }

    const entity = verifyBVN.entity;
    const firstName = entity.first_name;
    const lastName = entity.last_name;
    const middleName = entity.middle_name;
    const gender = entity.gender;
    const dateOfBirth = entity.date_of_birth;
    const phoneNumber1 = entity.phone_number1;
    const phoneNumber2 = entity.phone_number2;
    const email = entity.email;
    const enrollmentBank = entity.enrollment_bank;
    const enrollmentBranch = entity.enrollment_branch;
    const levelOfAccount = entity.level_of_account;
    const lgaOfOrigin = entity.lga_of_origin;
    const lgaOfResidence = entity.lga_of_residence;
    const maritalStatus = entity.marital_status;
    const nameOnCard = entity.name_on_card;
    const nationality = entity.nationality;
    const registrationDate = entity.registration_date;
    const residentialAddress = entity.residential_address;
    const stateOfOrigin = entity.state_of_origin;
    const stateOfResidence = entity.state_of_residence;
    const title = entity.title;
    const watchListed = entity.watch_listed;
    const imageBVN = entity.image;
    const imageNIN = verifyNIN.entity.photo;

    // if (firstName === "" || lastName === "" || phoneNumber1 === "") {
    //   return res.status(400).json({ error: 'BVN verification failed, missing essential user details' });
    // }

    // // Create user
    // const user = await User.create({
    //   bvn,
    //   firstName,
    //   lastName,
    //   middleName,
    //   gender,
    //   dateOfBirth,
    //   phoneNumber1,
    //   imageBVN,
    //   imageNIN,
    //   nin
    // });

    const user = await User.create({
      bvn,
      firstName,
      lastName,
      middleName,
      gender,
      dateOfBirth,
      phoneNumber1,
      phoneNumber2,
      email,
      enrollmentBank,
      enrollmentBranch,
      levelOfAccount,
      lgaOfOrigin,
      lgaOfResidence,
      maritalStatus,
      nameOnCard,
      nationality,
      registrationDate,
      residentialAddress,
      stateOfOrigin,
      stateOfResidence,
      title,
      watchListed,
      imageBVN,
      imageNIN,
      nin
    });


    const id = user.id;
    // await Wallet.create({ userId: id });

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

    const photoid_image = user.imageBVN; 
    const selfie_image = user.imageNIN;
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
    // if (!result || !result.entity) {
    //   return res.status(400).json({ error: 'Invalid result from Dojah API' });
    // }
    
    
    // if (result.entity.selfie.confidence_value < 90) {
    //   return res.status(400).json({ error: 'Selfie verification confidence too low', details: result.entity });
    // }else{
      return res.status(200).json(result);
    // }
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
    const saved = await Pin.create({ hashedPin: hashed, userId: user.id });
    res.status(201).json({ message: 'PIN created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// exports.login = async (req, res) => {
//   try {
//     const { phone, password } = req.body;
//     const user = await User.findOne({ where: { phone } });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     const pinRecord = await Pin.findOne({ where: { userId: user.id } });
//     if (!pinRecord) {
//       return res.status(404).json({ error: 'PIN not set' });
//     }
//     const isMatch = await bcrypt.compare(pin, pinRecord.hashedPin);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid PIN' });
//     }
//     const token = jwt.generateToken(user);
//     res.status(200).json({ token });
//   }
//   catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

exports.loginUser = async (req, res) => {
  const { phone, pin } = req.body;

  try { 
    const user = await User.findOne({ where: { phone } });

    if (!user || !user.password) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.generateToken(user);

    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
};

exports.getUser = async (req, res) => {
  const authUser = req.user; // from token middleware

  try {
    const user = await User.findByPk(authUser.id, {
      include: [      // assuming Profile has userId foreign key
        { model: Wallet },
        { model: Transaction },
        { model: BankAccount},
        { model: PaymentIntentModel},
        { model: Transaction},
        { model: Pin}
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

exports.createPin = async (req, res) => {
  const { pin, type } = req.body;
  const user = req.user; 

  try {
    const hashedPin = await bcrypt.hash(password, 10);
    if(type == "authentication") {
      user.autheticationPin = hashedPin;
      await user.save();
    } 

    if(type == "transaction") {
      user.transactionPin = hashedPin;
      await user.save();
    }
    res.status(201).json({ status: 201, message: `${type} Pin created successfully` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// exports.resetPin = async (req, res) => {

// }


exports.resetPin = async (req, res) =>{
  const { pin, type, phone } = req.body;
  try {
    const user = User.findOne({where: phone});

    if(!user) { 
      return res.json(404).json({ status: 404, error: "User with this phone number not found"});
    }

    const hashedPin = await bcrypt.hash(password, 10);
    if(type == "authentication") {
      user.autheticationPin = hashedPin;
      await user.save();
    } 

    if(type == "transaction") {
      user.transactionPin = hashedPin;
      await user.save();
    }
    return res.status(201).json({ status: 201, message: `${type} Pin Reset successfully` });
  }catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// exports.verifyNIN = async (req, res) => {

// }
