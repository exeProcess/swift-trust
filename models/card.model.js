const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Card = sequelize.define('Card', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  token: DataTypes.STRING,
  last4: DataTypes.STRING,
  expMonth: DataTypes.STRING,
  expYear: DataTypes.STRING,
  brand: DataTypes.STRING
});

module.exports = Card;