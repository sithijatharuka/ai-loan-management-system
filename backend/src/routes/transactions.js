import express from 'express';
import Transaction from '../models/transaction.js';
import Customer from '../models/customer.js';
import authMiddleware from './authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.customerId) {
    filter.customerId = req.query.customerId.toString();
  }
  const transactions = await Transaction.find(filter).sort({ date: -1 });
  res.json(transactions);
});

router.post('/', async (req, res) => {
  const { customerId, amount, date, type } = req.body;

  if (!customerId || !amount || !type) {
    return res.status(400).json({ message: 'Missing required transaction fields' });
  }

  const customer = await Customer.findById(customerId);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  const numericAmount = Number(amount);
  if (numericAmount <= 0) {
    return res.status(400).json({ message: 'Transaction amount must be greater than zero' });
  }

  if (type === 'payment') {
    const balanceBefore = customer.remainingBalance;
    const balanceAfter = balanceBefore - numericAmount;

    if (balanceAfter < 0) {
      return res.status(400).json({ message: 'Payment exceeds remaining balance' });
    }

    customer.remainingBalance = balanceAfter;
    customer.status = balanceAfter === 0 ? 'completed' : 'active';
    await customer.save();

    const transaction = new Transaction({
      customerId: customer.id,
      customerName: customer.name,
      amount: numericAmount,
      date: date || new Date().toISOString(),
      type,
      balanceBefore,
      balanceAfter,
    });

    await transaction.save();
    return res.status(201).json(transaction);
  }

  res.status(400).json({ message: 'Unsupported transaction type' });
});

export default router;
