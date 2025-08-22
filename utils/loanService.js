// services/loanService.js
const axios = require('axios');
const { User, Loan, LoanRate, sequelize } = require('../models');

exports.checkFirstTimer = async (id) => {
  try{
    const userLoan = await Loan.findOne({where: {userId: id}});
    if(userLoan.status == "active"){
      return {eligibleAmount: "0"};
    }
    if(!userLoan){
      return {eligibleAmount: "100"};
    }
  }
}

