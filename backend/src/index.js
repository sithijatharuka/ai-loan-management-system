import express from 'express';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import transactionRoutes from './routes/transactions.js';
import User from './models/user.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

const mongoUri = process.env.MONGO_URI;

async function ensureAdminUser() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const existingUser = await User.findOne({ username: adminUsername });
  if (existingUser) {
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({ username: adminUsername, passwordHash });
  console.log(`Created default admin user: ${adminUsername}`);
}

mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log(`Connected to MongoDB at ${mongoUri}`);
    await ensureAdminUser();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
