const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Pin = sequelize.define('Pin', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    hashedPin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  Pin.beforeCreate(async (pin) => {
    if (pin.hashedPin) {
      pin.hashedPin = await bcrypt.hash(pin.hashedPin, 10);
    }
  });

  return Pin;
};

