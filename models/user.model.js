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
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    phoneNumber1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber2: {
      type: DataTypes.STRING
    },
    image: {
      type: DataTypes.TEXT // to hold base64 image
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
      type: DataTypes.ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER')
    },
    nameOnCard: {
      type: DataTypes.STRING
    },
    nationality: {
      type: DataTypes.STRING
    },
    registrationDate: {
      type: DataTypes.DATEONLY
    },
    residentialAddress: {
      type: DataTypes.STRING
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
      type: DataTypes.ENUM('YES', 'NO'),
      defaultValue: 'NO'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    bankoneCustomerId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bankoneAccountNumber: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  return User;
};
