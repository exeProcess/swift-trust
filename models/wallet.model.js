const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Wallet = sequelize.define('Wallet', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  balance: { type: DataTypes.DECIMAL(20, 2), defaultValue: 0.0 },
  currency: { type: DataTypes.STRING, defaultValue: 'NGN' }
});

module.exports = Wallet;