// services/loanService.js
const axios = require('axios');
const { User, Loan, LoanRate, sequelize } = require('../models');


exports.checkFirstTimer = async (id) => {
  try {
    const userLoan = await Loan.findOne({ where: { userId: id } });

    if (!userLoan) {
      // No loan found → first timer
      return { eligibleAmount: "100" };
    }

    if (userLoan.status === "active") {
      return { eligibleAmount: "0" };
    }

    if (userLoan.status !== "active") {
      return { eligibleAmount: "1,000,000" };
    }

  } catch (err) {
    throw new Error(err.message);
  }
};

