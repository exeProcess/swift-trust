module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define('Loan', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('personal', 'business'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
    },
    interestRate: {
      type: DataTypes.FLOAT,
      defaultValue: 5.0
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'disbursed', 'repaid'),
      defaultValue: 'pending'
    },
    tenor: {
      type: DataTypes.INTEGER
    },
    dueDate: {
      type: DataTypes.DATE
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    WalletId: {
      type: DataTypes.UUID,
      allowNull: true // only needed if tied to wallet disbursement
    }
  });

  return Loan;
};

