const { KYC, User } = require('../models');

exports.listKycSubmissions = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const kycs = await KYC.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'email', 'name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(kycs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveKyc = async (req, res) => {
  try {
    const kyc = await KYC.findByPk(req.params.id);
    if (!kyc) return res.status(404).json({ error: 'KYC record not found' });
    await kyc.update({ status: 'approved' });
    res.json({ message: 'KYC approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rejectKyc = async (req, res) => {
  try {
    const kyc = await KYC.findByPk(req.params.id);
    if (!kyc) return res.status(404).json({ error: 'KYC record not found' });
    await kyc.update({ status: 'rejected' });
    res.json({ message: 'KYC rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
