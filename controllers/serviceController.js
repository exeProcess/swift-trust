const { User, Wallet, sequelize} = require('../models');
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

exports.buyAirtime = async (req, res) => {
    const user = req.user.id;

    try{
        const airtimePurchaseRequest = await remita.buyAirtime(req.body);

        return res.status(200).json(airtimePurchaseRequest);
    }catch (error) {
        console.error('Error buying airtime:', error.message);
        return res.status(500).json({ error: error.message});
    }
}