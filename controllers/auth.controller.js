const { User, Wallet, sequelize} = require('../models');
const jwt = require('../utils/jwt');
const sendEmail = require('../utils/otp').sendVerificationEmail;
const bcrypt = require('bcrypt');
const dojah = require('../utils/dojah');
const notifier = require('../utils/notifier');
const paymentIntentModel = require('../models/paymentIntent.model');



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
    const { bvn, nin } = req.body;

    if (!bvn) {
      return res.status(400).json({ error: 'BVN is required' });
    }
    if (!nin) {
      return res.status(400).json({ error: 'NIN is required' });
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
      return res.status(400).json({status: 400, message: "BVN and NIN records do not match"});
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

    const responsePayload = {
      id: user.id,
      fullName: `${user.firstName} ${user.middleName} ${user.lastName}`,
      dob: user.dateOfBirth,
      phoneNumber: user.phoneNumber1,
      email: user.email
    };

    

    const token = jwt.generateToken(user);
    return res.status(201).json({
      token,
      responsePayload
    });
  } catch (err) {
    console.error('Registration error:', err.result?.data || err.message);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
};



exports.sendOtp = async (req, res) => {
  const user = req.user; 
  const { phoneNumber, channel, email } = req.body;


  try {
    const userData = await User.findOne({ where: { id: user.id} });
    const verificationCode = generateSixDigitCode();

    userData.verificationCode = verificationCode;
    userData.phoneNumber1 = phoneNumber;
    userData.email = email !== undefined ? email : userData.email;

    await userData.save();
    const sender_id = "swift";
    const destination = phoneNumber;
    const priority = true;
    const otp = verificationCode;
    const otpPayload = {
      sender_id,
      destination,
      channel,
      priority,
      otp
    }

    userData.verificationCode = verificationCode;
    userData.phoneNumber1 = phoneNumber;
    userData.email = email !== undefined ? email : userData.email;
    await sendEmail(email, verificationCode, 'Your verification code is: ');
    await dojah.sendOtp(otpPayload);

    

    await Wallet.create({
      userId: user.id,
      accountNumber: phoneNumber.slice(1)
    });
    return res.status(200).json({
      status: 200,
      message: "OTP sent to user's email successfully"
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message
    });
  }

}

exports.verifyOtp = async (req, res) => {
  const user = req.user;
  const { otp } = req.body;

  try {
    const userData = await User.findOne({ where: { id: user.id } });

    if (!userData || userData.verificationCode !== otp) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    userData.isVerified = true;
    userData.verificationCode = null;
    await user.save();

    // const token = jwtUtils.generateToken(user); 

    return res.status(200).json({ status: 200, message: 'OTP Verification successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}




exports.setLoginPin = async (req, res) => {
  const user = req.user;
  try {
    const { pin } = req.body;
    const userData = await User.findOne({ where: { id: user.id } });
    if(!pin){
      return res.status(400).json({status: 400, message: "Login pin is required"});
    }
    const hashed = await bcrypt.hash(pin, 10);
    // const saved = await Pin.create({ hashedPin: hashed, userId: user.id });
    userData.authenticationPin = hashed;
    await userData.save();
    res.status(201).json({ message: 'PIN created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setTransactionPin = async (req, res) => {
  const user = req.user;
  try {
    const { pin } = req.body;
    const userData = await User.findOne({ where: { id: user.id } });
    if(!pin){
      return res.status(400).json({status: 400, message: "Transaction pin is required"});
    }
    const hashed = await bcrypt.hash(pin, 10);
    // const saved = await Pin.create({ hashedPin: hashed, userId: user.id });
    userData.transactionPin = hashed;
    await userData.save();
    res.status(201).json({ message: 'PIN created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.loginWithPin = async (req, res) => {
  const { phone, email, pin } = req.body;

  if (!pin || (!phone && !email)) {
    return res.status(400).json({ status: 400, message: "Phone or Email and PIN are required" });
  }

  try {
    // Find user by phone or email
    const user = await User.findOne({
      where: {
        ...(phone ? { phoneNumber1: phone } : {}),
        ...(email ? { email } : {})
      }
    });

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    // Check if user has set a transaction pin
    if (!user.authenticationPin) {
      return res.status(400).json({ status: 400, message: "Autentication PIN not set for this user" });
    }

    // Compare pin
    const isMatch = await bcrypt.compare(pin, user.authenticationPin);
    if (!isMatch) {
      return res.status(401).json({ status: 401, message: "Invalid PIN" });
    }

    
    const token = jwt.generateToken(user);

    res.status(200).json({
      status: 200,
      message: "Login successful",
      token, 
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name
      }
    });

  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};


exports.getUser = async (req, res) => {
  const authUser = req.user; // from token middleware

  try {
    const user = await User.findByPk(authUser.id, {
      include: [
        { model: Wallet, as: 'wallet' }
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



// exports.resetPin = async (req, res) =>{
//   const { pin, type, phone } = req.body;
//   try {
//     const user = User.findOne({where: phone});

//     if(!user) { 
//       return res.json(404).json({ status: 404, error: "User with this phone number not found"});
//     }

//     const hashedPin = await bcrypt.hash(password, 10);
//     if(type == "authentication") {
//       user.autheticationPin = hashedPin;
//       await user.save();
//     } 

//     if(type == "transaction") {
//       user.transactionPin = hashedPin;
//       await user.save();
//     }
//     return res.status(201).json({ status: 201, message: `${type} Pin Reset successfully` });
//   }catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// }

const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });

    if (!existing) {
      return res.status(400).json({ error: 'User with this email does not exists.' });
    }

    let verificationCode = generateSixDigitCode();

    // const user = await User.create({
    //   email,
    //   isVerified: false,
    //   verificationCode,
    // });

    existing.verificationCode = verificationCode;
    await existing.save();
    await sendEmail(email, verificationCode, 'Your reset password verification code is: ');
    
    res.status(201).json({status: 200, message: 'Reset pin verification code sent to email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Caught error: " + err.message });
  }
};

exports.verifyResetPasswordOtp = async (req, res ) =>{
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    // const token = jwtUtils.generateToken(user); 

    return res.status(200).json({ status: 200, message: 'Verification successful. You can now reset your password.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Verification failed.' });
  }
}

exports.resetPassword = async (req, res) => {
  const { email, pin } = req.body;
  if (!email || !pin) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User with this email does not exists.' });
    }

    const hashedPassword = await bcrypt.hash(pin, 10);
    user.authenticationPin = hashedPassword;
    user.verificationCode = null; // Clear verification code after password reset
    await user.save();

    return res.status(200).json({ message: 'Pin reset successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}