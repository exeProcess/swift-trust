module.exports = (sequelize, DataTypes) => {
  const Nok = sequelize.define('Nok', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nextOfKinName: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
    },
    nextOfKinPhoneNumber: {
      type: DataTypes.FLOAT,
      defaultValue: 5.0
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  return Nok;
};

