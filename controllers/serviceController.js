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
    const { categoryCode, provider } = req.params;
    try {
        const products = await remita.getVendingProducts({ categoryCode, provider });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching Remita vendor products:', error.message);
        res.status(500).json({ error: 'Unable to retrieve vendor products from Remita' });
    }
}