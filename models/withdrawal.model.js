module.exports = (sequelize, DataTypes) => {
  const Withdrawal = sequelize.define('Withdrawal', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    amount: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed'),
      defaultValue: 'pending'
    },
    reference: {
      type: DataTypes.STRING,
      unique: true
    },
    accountNumber: {
      type: DataTypes.STRING
    },
    bankCode: {
      type: DataTypes.STRING
    },
    bankName: {
      type: DataTypes.STRING
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    BankAccountId: {
      type: DataTypes.UUID,
      allowNull: true
    }
  });

  return Withdrawal;
};

