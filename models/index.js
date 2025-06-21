const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const DB_NAME = process.env.DB_NAME || 'swift_trust';
const DB_USER = process.env.DB_USER || 'swift_user';
const DB_PASS = process.env.DB_PASS || 'swift-trust-jubril';
const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASS,
  {
    host: process.env.DB_HOST || localhost,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user.model')(sequelize, DataTypes);
db.Pin = require('./pin.model')(sequelize, DataTypes);
db.KYC = require('./kyc.model')(sequelize, DataTypes);
db.BankAccount = require('./bankAccount.model')(sequelize, DataTypes);
db.Address = require('./address.model')(sequelize, DataTypes);
db.Wallet = require('./wallet.model')(sequelize, DataTypes);
db.Transaction = require('./transaction.model')(sequelize, DataTypes);
db.Loan = require('./loan.model')(sequelize, DataTypes);
db.PaymentIntent = require('./paymentIntent.model')(sequelize, DataTypes);
db.Withdrawal = require('./withdrawal.model')(sequelize, DataTypes);
db.BillPayment = require('./billPayment.model')(sequelize, DataTypes);
db.Card = require('./card.model')(sequelize, DataTypes);
db.Admin = require('./admin.model')(sequelize, DataTypes);
db.Notification = require('./notification.model')(sequelize, DataTypes);
db.LoanRate = require('./loanRate.model')(sequelize, DataTypes);



// Associations
db.User.hasMany(db.Card);
db.Card.belongsTo(db.User);

db.User.hasMany(db.Notification);
db.Notification.belongsTo(db.User);

db.User.hasMany(db.BillPayment);
db.BillPayment.belongsTo(db.User);

db.User.hasMany(db.Withdrawal);
db.Withdrawal.belongsTo(db.User);

db.BankAccount.hasMany(db.Withdrawal);
db.Withdrawal.belongsTo(db.BankAccount);

db.User.hasMany(db.PaymentIntent);
db.PaymentIntent.belongsTo(db.User);

db.User.hasMany(db.Loan);
db.Loan.belongsTo(db.User);

db.User.hasOne(db.Wallet);
db.Wallet.belongsTo(db.User);

db.Wallet.hasMany(db.Transaction);
db.Transaction.belongsTo(db.Wallet);

db.User.hasMany(db.BankAccount);
db.BankAccount.belongsTo(db.User);

db.User.hasOne(db.Address);
db.Address.belongsTo(db.User);

db.User.hasOne(db.Pin);
db.Pin.belongsTo(db.User);

db.User.hasOne(db.KYC);
db.KYC.belongsTo(db.User);

module.exports = db;

