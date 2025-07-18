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
    image: {
      type: DataTypes.TEXT // to hold base64 image
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
