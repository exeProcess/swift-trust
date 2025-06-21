module.exports = (sequelize, DataTypes) => {
  const LoanRate = sequelize.define('LoanRate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('personal', 'business'),
      allowNull: false
    }
  });

  return LoanRate;
};

