module.exports = (sequelize, DataTypes) => {
  const BillPayment = sequelize.define('BillPayment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING
    },
    target: {
      type: DataTypes.STRING
    },
    amount: {
      type: DataTypes.DECIMAL(20, 2)
    },
    providerRef: {
      type: DataTypes.STRING
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

  return BillPayment;
};

