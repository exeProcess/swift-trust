const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Address = sequelize.define('Address', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  addressLine: DataTypes.STRING,
  state: DataTypes.STRING,
  city: DataTypes.STRING,
  proofDocUrl: DataTypes.STRING
});

module.exports = Address;