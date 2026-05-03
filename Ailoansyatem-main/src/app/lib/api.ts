import { Customer, Transaction } from '../types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function handleResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || response.statusText || 'API request failed');
  }
  return body;
}

export async function getCustomers(): Promise<Customer[]> {
  return handleResponse(await fetch(`${apiBaseUrl}/customers`));
}

export async function getCustomer(id: string): Promise<Customer> {
  return handleResponse(await fetch(`${apiBaseUrl}/customers/${id}`));
}

export async function createCustomer(payload: {
  name: string;
  contact: string;
  address: string;
  loanAmount: number;
  interestRate: number;
  loanDuration: number;
}): Promise<Customer> {
  return handleResponse(
    await fetch(`${apiBaseUrl}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  );
}

export async function getTransactions(customerId?: string): Promise<Transaction[]> {
  const url = customerId ? `${apiBaseUrl}/transactions?customerId=${encodeURIComponent(customerId)}` : `${apiBaseUrl}/transactions`;
  return handleResponse(await fetch(url));
}

export async function addPayment(payload: {
  customerId: string;
  amount: number;
  date: string;
}): Promise<Transaction> {
  return handleResponse(
    await fetch(`${apiBaseUrl}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, type: 'payment' }),
    }),
  );
}
