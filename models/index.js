const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

const User = require('./user.model');
const Pin = require('./pin.model');
const KYC = require('./kyc.model');
const BankAccount = require('./bankAccount.model');
const Address = require('./address.model');
const Wallet = require('./wallet.model');
const Transaction = require('./transaction.model');
const Loan = require('./loan.model');
const PaymentIntent = require('./paymentIntent.model');
const Withdrawal = require('./withdrawal.model');
const BillPayment = require('./billPayment.model');
const Card = require('./card.model');
const Admin = require('./admin.model');
User.hasMany(Card);
Card.belongsTo(User);

User.hasMany(BillPayment);
BillPayment.belongsTo(User);


User.hasMany(Withdrawal);
Withdrawal.belongsTo(User);

BankAccount.hasMany(Withdrawal);
Withdrawal.belongsTo(BankAccount);



User.hasMany(PaymentIntent);
PaymentIntent.belongsTo(User);


User.hasMany(Loan);
Loan.belongsTo(User);


User.hasOne(Wallet);
Wallet.belongsTo(User);

Wallet.hasMany(Transaction);
Transaction.belongsTo(Wallet);


User.hasMany(BankAccount);
BankAccount.belongsTo(User);

User.hasOne(Address);
Address.belongsTo(User);

User.hasOne(Pin);
Pin.belongsTo(User);

User.hasOne(KYC);
KYC.belongsTo(User);

module.exports = { 
    Sequelize, 
    User, 
    Pin, 
    KYC, 
    BankAccount, 
    Address, 
    Wallet, 
    Transaction, 
    Loan, 
    PaymentIntent, 
    Withdrawal, 
    BillPayment,
    Card,
    Admin 
};
// This file initializes the Sequelize connection and models, and sets up associations between them.