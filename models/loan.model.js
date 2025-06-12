const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Loan = sequelize.define('Loan', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.ENUM('personal', 'business'), allowNull: false },
  amount: { type: DataTypes.DECIMAL(20, 2), allowNull: false },
  interestRate: { type: DataTypes.FLOAT, defaultValue: 5.0 },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'disbursed', 'repaid'), defaultValue: 'pending' },
  tenor: { type: DataTypes.INTEGER },
  dueDate: { type: DataTypes.DATE }
});

module.exports = Loan;