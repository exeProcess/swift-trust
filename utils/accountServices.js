const axios = require('axios');
const { User, Pin, Wallet } = require('../models');

exports.fundWallet = async (req, res) => {
    