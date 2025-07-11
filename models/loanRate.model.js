module.exports = (sequelize, DataTypes) => {
  const LoanRate = sequelize.define('LoanRate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  return LoanRate;
};

