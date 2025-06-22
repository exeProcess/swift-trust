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
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    middle_name: {
      type: DataTypes.STRING
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other')
    },
    date_of_birth: {
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
    phone_number1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone_number2: {
      type: DataTypes.STRING
    },
    image: {
      type: DataTypes.TEXT // to hold base64 image
    },
    enrollment_bank: {
      type: DataTypes.STRING
    },
    enrollment_branch: {
      type: DataTypes.STRING
    },
    level_of_account: {
      type: DataTypes.STRING
    },
    lga_of_origin: {
      type: DataTypes.STRING
    },
    lga_of_residence: {
      type: DataTypes.STRING
    },
    marital_status: {
      type: DataTypes.ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER')
    },
    name_on_card: {
      type: DataTypes.STRING
    },
    nationality: {
      type: DataTypes.STRING
    },
    registration_date: {
      type: DataTypes.DATEONLY
    },
    residential_address: {
      type: DataTypes.STRING
    },
    state_of_origin: {
      type: DataTypes.STRING
    },
    state_of_residence: {
      type: DataTypes.STRING
    },
    title: {
      type: DataTypes.STRING
    },
    watch_listed: {
      type: DataTypes.ENUM('YES', 'NO'),
      defaultValue: 'NO'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    bankbankoneCustomerId: {
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
