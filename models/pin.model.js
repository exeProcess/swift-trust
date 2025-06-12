const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Pin = sequelize.define('Pin', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hashedPin: { type: DataTypes.STRING, allowNull: false },
});

Pin.beforeCreate(async (pin) => {
  pin.hashedPin = await bcrypt.hash(pin.hashedPin, 10);
});

module.exports = Pin;