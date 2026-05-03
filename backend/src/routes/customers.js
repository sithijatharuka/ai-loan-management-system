import express from 'express';
import Customer from '../models/customer.js';
import Transaction from '../models/transaction.js';

const router = express.Router();

function calculateMonthlySettlement(amount, annualRate, months) {
  const monthlyRate = annualRate / 100 / 12;
  if (!monthlyRate || months === 0) {
    return amount / months;
  }
  return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

function calculateTotalAmount(amount, annualRate, months) {
  const monthly = calculateMonthlySettlement(amount, annualRate, months);
  return Number((monthly * months).toFixed(2));
}

router.get('/', async (req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  res.json(customers);
});

router.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  res.json(customer);
});

router.post('/', async (req, res) => {
  const { name, contact, address, loanAmount, interestRate, loanDuration } = req.body;

  if (!name || !contact || !address || !loanAmount || !interestRate || !loanDuration) {
    return res.status(400).json({ message: 'Missing required customer fields' });
  }

  const monthlySettlement = Number(
    calculateMonthlySettlement(Number(loanAmount), Number(interestRate), Number(loanDuration)).toFixed(2)
  );
  const totalAmount = calculateTotalAmount(Number(loanAmount), Number(interestRate), Number(loanDuration));

  const customer = new Customer({
    name,
    contact,
    address,
    loanAmount: Number(loanAmount),
    interestRate: Number(interestRate),
    loanDuration: Number(loanDuration),
    monthlySettlement,
    totalAmount,
    remainingBalance: totalAmount,
    status: 'active',
  });

  await customer.save();

  const transaction = new Transaction({
    customerId: customer.id,
    customerName: customer.name,
    amount: customer.loanAmount,
    type: 'loan',
    balanceBefore: 0,
    balanceAfter: customer.totalAmount,
  });

  await transaction.save();

  res.status(201).json(customer);
});

router.put('/:id', async (req, res) => {
  const updates = { ...req.body };
  if (updates.remainingBalance !== undefined) {
    updates.remainingBalance = Number(updates.remainingBalance);
    if (updates.remainingBalance === 0) {
      updates.status = 'completed';
    } else if (updates.remainingBalance < 0) {
      return res.status(400).json({ message: 'Remaining balance cannot be negative' });
    }
  }

  const customer = await Customer.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  res.json(customer);
});

router.get('/:id/transactions', async (req, res) => {
  const transactions = await Transaction.find({ customerId: req.params.id }).sort({ date: -1 });
  res.json(transactions);
});

export default router;
