module.exports = (sequelize, DataTypes) => {
  const PaymentIntent = sequelize.define('PaymentIntent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    reference: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed'),
      defaultValue: 'pending'
    },
    metadata: {
      type: DataTypes.JSON
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  return PaymentIntent;
};

