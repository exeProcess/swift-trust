const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  phone: { type: DataTypes.STRING, unique: true, allowNull: false },
  role: { type: DataTypes.ENUM('customer', 'admin', 'loan_officer', 'finance_manager', 'support'), defaultValue: 'customer' },
  bvn: { type: DataTypes.STRING },
  isPhoneVerified: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = User;