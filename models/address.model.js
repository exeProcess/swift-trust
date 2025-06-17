module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    addressLine: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    proofDocUrl: {
      type: DataTypes.STRING,
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  return Address;
};

