import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Clock, Users, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { getCustomers, getTransactions } from '../lib/api';
import { Customer, Transaction, DashboardMetrics } from '../types';

export function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLoanGiven: 0,
    totalCollected: 0,
    pendingAmount: 0,
    activeCustomers: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [customersData, transactionsData] = await Promise.all([
          getCustomers(),
          getTransactions(),
        ]);

        const totalLoanGiven = customersData.reduce((sum, c) => sum + c.totalAmount, 0);
        const pendingAmount = customersData.reduce((sum, c) => sum + c.remainingBalance, 0);
        const totalCollected = totalLoanGiven - pendingAmount;
        const activeCustomers = customersData.filter(c => c.status === 'active').length;

        setCustomers(customersData);
        setMetrics({
          totalLoanGiven,
          totalCollected,
          pendingAmount,
          activeCustomers,
        });
        setRecentTransactions(transactionsData.slice(0, 6));
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      }
    }

    loadDashboard();
  }, []);

  const collectionRate = metrics.totalLoanGiven > 0
    ? Math.round((metrics.totalCollected / metrics.totalLoanGiven) * 100)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor your loan portfolio performance</p>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Loan Given"
            value={`Rs ${metrics.totalLoanGiven.toLocaleString()}`}
            icon={DollarSign}
            color="blue"
          />
          <MetricCard
            title="Amount Collected"
            value={`Rs ${metrics.totalCollected.toLocaleString()}`}
            icon={TrendingUp}
            color="green"
          />
          <MetricCard
            title="Pending Amount"
            value={`Rs ${metrics.pendingAmount.toLocaleString()}`}
            icon={Clock}
            color="orange"
          />
          <MetricCard
            title="Active Customers"
            value={metrics.activeCustomers.toString()}
            icon={Users}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              {recentTransactions.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${
                            transaction.type === 'payment'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {transaction.type === 'payment' ? 'Payment' : 'Loan'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Rs {transaction.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  No transactions yet
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Portfolio Risk Level</span>
                  <span className={`text-sm font-medium ${
                    collectionRate >= 90 ? 'text-green-600' :
                    collectionRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {collectionRate >= 90 ? 'Low' : collectionRate >= 70 ? 'Medium' : 'High'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      collectionRate >= 90 ? 'bg-green-500' :
                      collectionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${100 - collectionRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {collectionRate >= 90
                    ? 'Excellent portfolio health with strong collection rate'
                    : collectionRate >= 70
                    ? 'Moderate risk - monitor pending payments closely'
                    : 'High risk - immediate attention required'}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-start gap-3 mb-4">
                  {collectionRate >= 80 ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">Collection Performance</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {collectionRate}% collection rate
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Customers</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {customers.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Collection Rate</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{collectionRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: typeof DollarSign;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

function MetricCard({ title, value, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
