const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.ENUM('credit', 'debit'), allowNull: false },
  amount: { type: DataTypes.DECIMAL(20, 2), allowNull: false },
  description: { type: DataTypes.STRING },
  balanceBefore: { type: DataTypes.DECIMAL(20, 2) },
  balanceAfter: { type: DataTypes.DECIMAL(20, 2) }
});

module.exports = Transaction;