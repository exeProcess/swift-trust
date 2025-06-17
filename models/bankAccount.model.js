module.exports = (sequelize, DataTypes) => {
  const BankAccount = sequelize.define('BankAccount', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bankCode: {
      type: DataTypes.STRING
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  return BankAccount;
};

