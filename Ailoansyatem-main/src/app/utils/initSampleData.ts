import { storage } from './storage';
import { Customer, Transaction } from '../types';
import { calculateMonthlySettlement, calculateTotalAmount } from './loanCalculations';

export const initializeSampleData = () => {
  const existingCustomers = storage.getCustomers();
  if (existingCustomers.length > 0) {
    return;
  }

  const sampleCustomers: Omit<Customer, 'id' | 'createdAt' | 'monthlySettlement' | 'totalAmount' | 'remainingBalance' | 'progressReferenceAmount'>[] = [
    {
      name: 'John Miller',
      contact: '555-0101',
      address: '123 Oak Street, Springfield',
      loanAmount: 5000,
      interestRate: 12,
      loanDuration: 12,
      status: 'active',
    },
    {
      name: 'Emma Davis',
      contact: '555-0102',
      address: '456 Maple Avenue, Riverside',
      loanAmount: 3000,
      interestRate: 10,
      loanDuration: 6,
      status: 'active',
    },
    {
      name: 'Michael Chen',
      contact: '555-0103',
      address: '789 Pine Road, Lakewood',
      loanAmount: 10000,
      interestRate: 15,
      loanDuration: 24,
      status: 'active',
    },
  ];

  const now = Date.now();
  const customers: Customer[] = sampleCustomers.map((sample, index) => {
    const monthlySettlement = calculateMonthlySettlement(
      sample.loanAmount,
      sample.interestRate,
      sample.loanDuration
    );
    const totalAmount = calculateTotalAmount(
      sample.loanAmount,
      sample.interestRate,
      sample.loanDuration
    );

    const customer: Customer = {
      ...sample,
      id: `${now + index}`,
      createdAt: new Date(Date.now() - (30 - index * 5) * 24 * 60 * 60 * 1000).toISOString(),
      monthlySettlement,
      totalAmount,
      remainingBalance: totalAmount,
      progressReferenceAmount: totalAmount,
    };

    const loanTransaction: Transaction = {
      id: `${now + index * 2}`,
      customerId: customer.id,
      customerName: customer.name,
      amount: customer.loanAmount,
      date: customer.createdAt,
      type: 'loan',
      balanceBefore: 0,
      balanceAfter: totalAmount,
    };

    storage.addTransaction(loanTransaction);

    if (index === 0) {
      const paymentAmount = monthlySettlement * 3;
      const paymentTransaction: Transaction = {
        id: `${now + index * 2 + 1}`,
        customerId: customer.id,
        customerName: customer.name,
        amount: paymentAmount,
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'payment',
        balanceBefore: totalAmount,
        balanceAfter: totalAmount - paymentAmount,
      };
      storage.addTransaction(paymentTransaction);
      customer.remainingBalance = totalAmount - paymentAmount;
    }

    return customer;
  });

  customers.forEach(customer => storage.addCustomer(customer));
};
