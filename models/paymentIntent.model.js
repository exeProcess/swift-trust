const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const PaymentIntent = sequelize.define('PaymentIntent', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  reference: { type: DataTypes.STRING, unique: true },
  amount: DataTypes.DECIMAL(20, 2),
  status: { type: DataTypes.ENUM('pending', 'success', 'failed'), defaultValue: 'pending' },
  metadata: DataTypes.JSON
});

module.exports = PaymentIntent;
