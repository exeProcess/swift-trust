const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bvn: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    nin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authenticationPin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionPin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    middleName: {
      type: DataTypes.STRING
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other')
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY
    },
    phoneNumber1: {
      type: DataTypes.STRING
    },
    phoneNumber2: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    enrollmentBank: {
      type: DataTypes.STRING
    },
    enrollmentBranch: {
      type: DataTypes.STRING
    },
    levelOfAccount: {
      type: DataTypes.STRING
    },
    lgaOfOrigin: {
      type: DataTypes.STRING
    },
    lgaOfResidence: {
      type: DataTypes.STRING
    },
    maritalStatus: {
      type: DataTypes.STRING
    },
    nameOnCard: {
      type: DataTypes.STRING
    },
    nationality: {
      type: DataTypes.STRING
    },
    registrationDate: {
      type: DataTypes.STRING // can be changed to DataTypes.DATE if needed
    },
    residentialAddress: {
      type: DataTypes.TEXT
    },
    stateOfOrigin: {
      type: DataTypes.STRING
    },
    stateOfResidence: {
      type: DataTypes.STRING
    },
    title: {
      type: DataTypes.STRING
    },
    watchListed: {
      type: DataTypes.STRING
    },
    imageBVN: {
      type: DataTypes.TEXT, // to hold base64 image
      allowNull: false,
    },
    imageNIN: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationCode: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  return User;
};
