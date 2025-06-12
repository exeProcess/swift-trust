const { Loan, User, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getLoanMetrics = async (req, res) => {
  try {
    const { field } = req.query;
    let result;
    switch (field) {
      case 'totalValue':
        result = await Loan.sum('amount');
        break;
      case 'revenue':
        result = await Loan.sum('interest');
        break;
      case 'newToday':
        result = await Loan.count({ where: { createdAt: sequelize.where(sequelize.fn('DATE', sequelize.col('createdAt')), '=', new Date().toISOString().slice(0, 10)) } });
        break;
      case 'approvedToday':
        result = await Loan.count({ where: { status: 'approved', updatedAt: sequelize.where(sequelize.fn('DATE', sequelize.col('updatedAt')), '=', new Date().toISOString().slice(0, 10)) } });
        break;
      case 'pending':
        result = await Loan.count({ where: { status: 'pending' } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid metric field' });
    }
    res.json({ field, value: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listLoans = async (req, res) => {
  try {
    const { status, q } = req.query;
    const where = {};
    if (status) where.status = status;
    if (q) where['$User.name$'] = { [Op.iLike]: `%${q}%` };

    const loans = await Loan.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    await loan.update({ status: 'approved' });
    res.json({ message: 'Loan approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rejectLoan = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    await loan.update({ status: 'rejected' });
    res.json({ message: 'Loan rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    res.json(loan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};