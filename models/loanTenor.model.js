module.exports = (sequelize, DataTypes) => {
  const LoanTenor = sequelize.define('LoanTenor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenor: {
      type: DataTypes.ENUM('7 days', '14 days', '30 days'),
      allowNull: false
    }
  });

  return LoanTenor;
};

