module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define('Wallet', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    balance: {
      type: DataTypes.DECIMAL(20, 2),
      defaultValue: 0.0
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'NGN'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  return Wallet;
};

