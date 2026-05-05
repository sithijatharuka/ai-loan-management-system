import { Customer, Transaction } from '../types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';
const accessTokenKey = 'accessToken';

async function handleResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || response.statusText || 'API request failed');
  }
  return body;
}

function getAuthHeaders() {
  const token = localStorage.getItem(accessTokenKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function saveAccessToken(token: string) {
  localStorage.setItem(accessTokenKey, token);
}

export function removeAccessToken() {
  localStorage.removeItem(accessTokenKey);
}

export async function login(username: string, password: string) {
  return handleResponse(
    await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),
  );
}

export async function getCustomers(): Promise<Customer[]> {
  return handleResponse(
    await fetch(`${apiBaseUrl}/customers`, {
      headers: getAuthHeaders(),
    }),
  );
}

export async function getCustomer(id: string): Promise<Customer> {
  return handleResponse(
    await fetch(`${apiBaseUrl}/customers/${id}`, {
      headers: getAuthHeaders(),
    }),
  );
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
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    }),
  );
}

export async function getTransactions(customerId?: string): Promise<Transaction[]> {
  const url = customerId ? `${apiBaseUrl}/transactions?customerId=${encodeURIComponent(customerId)}` : `${apiBaseUrl}/transactions`;
  return handleResponse(
    await fetch(url, {
      headers: getAuthHeaders(),
    }),
  );
}

export async function addPayment(payload: {
  customerId: string;
  amount: number;
  date: string;
}): Promise<Transaction> {
  return handleResponse(
    await fetch(`${apiBaseUrl}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ ...payload, type: 'payment' }),
    }),
  );
}

export async function extendLoan(payload: {
  customerId: string;
  additionalAmount: number;
}): Promise<Customer> {
  return handleResponse(
    await fetch(`${apiBaseUrl}/customers/${payload.customerId}/extend`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ additionalAmount: payload.additionalAmount }),
    }),
  );
}
