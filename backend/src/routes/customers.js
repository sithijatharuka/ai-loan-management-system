import express from 'express';
import Customer from '../models/customer.js';
import Transaction from '../models/transaction.js';
import authMiddleware from './authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

function calculateMonthlySettlement(amount, annualRate, months) {
  // Formula: Monthly payment = (Loan amount + Interest) / Duration
  // Interest = (Loan Amount × Interest Rate × Duration) / (100 × 12)
  const totalInterest = (amount * annualRate * months) / (100 * 12);
  const totalAmount = amount + totalInterest;
  return Number((totalAmount / months).toFixed(2));
}

function calculateTotalAmount(amount, annualRate, months) {
  // Total Amount = Loan Amount + Interest
  // Interest = (Loan Amount × Interest Rate × Duration) / (100 × 12)
  const totalInterest = (amount * annualRate * months) / (100 * 12);
  return Number((amount + totalInterest).toFixed(2));
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
    progressReferenceAmount: totalAmount,
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

router.put('/:id/extend', async (req, res) => {
  const { additionalAmount } = req.body;

  if (!additionalAmount || Number(additionalAmount) <= 0) {
    return res.status(400).json({ message: 'Valid additional amount required' });
  }

  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  const oldTotalAmount = customer.totalAmount;
  const oldRemainingBalance = customer.remainingBalance;
  const amountPaid = oldTotalAmount - oldRemainingBalance;
  const progressReferenceAmount = customer.progressReferenceAmount ?? oldTotalAmount;

  customer.loanAmount += Number(additionalAmount);
  customer.progressReferenceAmount = progressReferenceAmount;
  customer.totalAmount = calculateTotalAmount(customer.loanAmount, customer.interestRate, customer.loanDuration);
  customer.monthlySettlement = calculateMonthlySettlement(customer.loanAmount, customer.interestRate, customer.loanDuration);
  customer.remainingBalance = customer.totalAmount - amountPaid;
  customer.status = customer.remainingBalance === 0 ? 'completed' : 'active';

  await customer.save();

  const transaction = new Transaction({
    customerId: customer.id,
    customerName: customer.name,
    amount: Number(additionalAmount),
    type: 'loan',
    balanceBefore: oldRemainingBalance,
    balanceAfter: customer.remainingBalance,
  });

  await transaction.save();

  res.json(customer);
});

router.get('/:id/transactions', async (req, res) => {
  const transactions = await Transaction.find({ customerId: req.params.id }).sort({ date: -1 });
  res.json(transactions);
});

export default router;
