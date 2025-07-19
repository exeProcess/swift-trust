const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();
const otpRoutes = require('./routes/otp.routes');
const kycRoutes = require('./routes/kyc.routes');
const bankRoutes = require('./routes/bankAccount.routes');
const addressRoutes = require('./routes/address.routes');
const walletRoutes = require('./routes/wallet.routes');
const transactionRoutes = require('./routes/transactions.routes');
const loanRoutes = require('./routes/loan.routes');
const bvnRoutes = require('./routes/bvn.routes');
const webhookRoutes = require('./routes/webhook.routes');
const withdrawalRoutes = require('./routes/withdrawal.routes');
const billRoutes = require('./routes/bills.routes');
const verifyRoutes = require('./routes/verify.routes');
const paymentRoutes = require('./routes/payment.routes');
const cardRoutes = require('./routes/card.routes');
const adminRoutes = require('./routes/admin.routes');
const adminKycRoutes = require('./routes/admin.kyc.routes');
const adminLoanRoutes = require('./routes/adminLoan.routes');





const app = express();
app.use(express.json({ limit: '300mb' })); // for JSON payloads
app.use(express.urlencoded({ extended: true, limit: '300mb' })); // for form-urlencoded (if used)
app.use(cors());
app.use(morgan('dev'));

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/loan', loanRoutes);
app.use('/api/bvn', bvnRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/kyc', adminKycRoutes);
app.use('/api/admin/loans', adminLoanRoutes);










const PORT = process.env.PORT || 3000
sequelize.sync({ force: true }).then(() => {
  console.log("✅ Database synced (all tables recreated).");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
app.get('/', (req, res) => {
  res.send('Swift Trust API is running');
});

//Copilot: Generate a Postman collection JSON with these routes:
// POST /api/v1/auth/login
// POST /api/v1/auth/register
// GET /api/v1/auth/profile
// Include example request body and response for each route