const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Withdrawal = sequelize.define('Withdrawal', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  amount: { type: DataTypes.DECIMAL(20, 2), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'success', 'failed'), defaultValue: 'pending' },
  reference: { type: DataTypes.STRING, unique: true },
  accountNumber: DataTypes.STRING,
  bankCode: DataTypes.STRING,
  bankName: DataTypes.STRING
});

module.exports = Withdrawal;
