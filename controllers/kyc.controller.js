const KYC = require('../models/kyc.model');

exports.submitKYC = async (req, res) => {
  try {
    const { nin, idCardUrl, selfieUrl } = req.body;
    const kyc = await KYC.create({ nin, idCardUrl, selfieUrl, UserId: req.user.id });
    res.status(201).json(kyc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getKYCStatus = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ where: { UserId: req.user.id } });
    if (!kyc) return res.status(404).json({ error: 'KYC not found' });
    res.json({ status: kyc.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};