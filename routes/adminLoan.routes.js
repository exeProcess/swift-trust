const express = require('express');
const router = express.Router();
const adminLoan = require('../controllers/adminLoan.controller');
const adminAuth = require('../middleware/adminAuth.middleware');

router.get('/metrics', adminAuth, adminLoan.getLoanMetrics);
router.get('/', adminAuth, adminLoan.listLoans);
router.get('/:id', adminAuth, adminLoan.getLoanById);
router.post('/:id/approve', adminAuth, adminLoan.approveLoan);
router.post('/:id/reject', adminAuth, adminLoan.rejectLoan);

module.exports = router;