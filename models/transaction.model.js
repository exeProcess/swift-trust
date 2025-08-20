module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('loan', 'repayment', 'withdrawal', 'deposit', 'fee', 'bill payment'),
      allowNull: false,
      defaultValue: 'deposit',
    },
    amount: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
  });

  return Transaction;
};

