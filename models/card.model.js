module.exports = (sequelize, DataTypes) => {
  const Card = sequelize.define('Card', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    token: {
      type: DataTypes.STRING
    },
    last4: {
      type: DataTypes.STRING
    },
    expMonth: {
      type: DataTypes.STRING
    },
    expYear: {
      type: DataTypes.STRING
    },
    brand: {
      type: DataTypes.STRING
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  return Card;
};

