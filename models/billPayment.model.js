const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const BillPayment = sequelize.define('BillPayment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: DataTypes.STRING,
  target: DataTypes.STRING,
  amount: DataTypes.DECIMAL(20, 2),
  providerRef: DataTypes.STRING,
  status: { type: DataTypes.ENUM('pending', 'success', 'failed'), defaultValue: 'pending' },
  metadata: DataTypes.JSON
});

module.exports = BillPayment;