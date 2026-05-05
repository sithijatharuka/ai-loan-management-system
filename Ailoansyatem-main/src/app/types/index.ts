export interface Customer {
  id: string;
  name: string;
  contact: string;
  address: string;
  loanAmount: number;
  interestRate: number;
  loanDuration: number;
  monthlySettlement: number;
  totalAmount: number;
  remainingBalance: number;
  progressReferenceAmount?: number;
  createdAt: string;
  status: 'active' | 'completed' | 'defaulted';
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  date: string;
  type: 'loan' | 'payment';
  balanceBefore: number;
  balanceAfter: number;
}

export interface DashboardMetrics {
  totalLoanGiven: number;
  totalCollected: number;
  pendingAmount: number;
  activeCustomers: number;
}
