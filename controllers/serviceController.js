const { User, Wallet, Transaction, sequelize} = require('../models');
const jwt = require('../utils/jwt');
const remita = require('../utils/remita');

exports.getRemitaServiceVendors = async (req, res) => {
    const categoryCode = req.params.service;
    try {
        const vendors = await remita.getProvidersByCode(categoryCode);
        res.status(200).json(vendors);
    } catch (error) {
        console.error('Error fetching Remita service vendors:', error.message);
        res.status(500).json({ error: 'Unable to retrieve service vendors from Remita' });
    }
}

exports.gerRemitaVendorProducts = async (req, res) => {
    const { categoryCode, providerCode } = req.params;
    const payload = { 
        categoryCode, providerCode 
    };
    try {
        const products = await remita.getVendingProducts(payload);
        return res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching Remita vendor products:', error.message);
        return res.status(500).json({ error: error.message });
    }

}

exports.buyAirtimeOrData = async (req, res) => {
    // const user = req.user.id;

    try{
        const airtimeOrDataPurchaseRequest = await remita.buyAirtimeOrData(req.body);
        
        return res.status(200).json(airtimeOrDataPurchaseRequest);
    }catch (error) {
        //console.error('Error buying airtime:', error.message);
        return res.status(500).json({ error: error.message});
    }
}

exports.buyElectricityOrCableTvSubscription = async (req, res) => {
    try {
        const electricityOrCableTvSubscriptionPurchaseRequest = await remita.buyElectricityOrCableTvSubscription(req.body);
        return res.status(200).json(electricityOrCableTvSubscriptionPurchaseRequest);
    } catch (error) {
        console.error('Error buying electricity:', error.message);
        return res.status(500).json({ error: electricityOrCableTvSubscriptionPurchaseRequest.error });
    }
}

exports.getRemitaBankList = async (req, res) => {
    try {
        const banks = await remita.getRemitaBankList();
        return res.status(200).json(banks);
    } catch (error) {
        console.error('Error fetching Remita bank list:', error.message);
        return res.status(500).json({ error: error.message });
    }
}

expoorts.nameEnquiry = async (req, res) => {
    try {
        const { accountNumber, bankCode } = req.body;
        if (!accountNumber || !bankCode) {
            return res.status(400).json({ error: 'Account number and bank code are required' });
        }

        const result = await remita.nameEnquiry(accountNumber, bankCode);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error('Error in name enquiry:', error.message);
        return res.status(500).json({ error: error.message });
    }
}