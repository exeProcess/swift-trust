module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    addressNumber: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING
    },
    proofOfAdress: {
      type: DataTypes.Text,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  return Address;
};

