import { Customer, Transaction } from '../types';

const CUSTOMERS_KEY = 'loan_customers';
const TRANSACTIONS_KEY = 'loan_transactions';

export const storage = {
  getCustomers: (): Customer[] => {
    const data = localStorage.getItem(CUSTOMERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCustomers: (customers: Customer[]) => {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  },

  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  },

  addCustomer: (customer: Customer) => {
    const customers = storage.getCustomers();
    customers.push(customer);
    storage.saveCustomers(customers);
  },

  updateCustomer: (id: string, updates: Partial<Customer>) => {
    const customers = storage.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updates };
      storage.saveCustomers(customers);
    }
  },

  addTransaction: (transaction: Transaction) => {
    const transactions = storage.getTransactions();
    transactions.unshift(transaction);
    storage.saveTransactions(transactions);
  },
};
