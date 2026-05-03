import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, User, Phone, MapPin, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { getCustomer, getTransactions } from '../lib/api';
import { Customer, Transaction } from '../types';

export function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!id) {
      return;
    }

    async function loadCustomerDetail() {
      try {
        const [foundCustomer, customerTransactions] = await Promise.all([
          getCustomer(id),
          getTransactions(id),
        ]);

        setCustomer(foundCustomer);
        setTransactions(customerTransactions);
      } catch (error) {
        console.error('Failed to load customer details', error);
        setCustomer(null);
      }
    }

    loadCustomerDetail();
  }, [id]);

  if (!customer) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Customer not found</p>
          <Link to="/customers" className="text-blue-600 hover:text-blue-800">
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  const paidAmount = customer.totalAmount - customer.remainingBalance;
  const paymentProgress = (paidAmount / customer.totalAmount) * 100;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Customers
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">{customer.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Customer loan details and transaction history</p>
      </header>

      <main className="p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="text-sm font-medium text-gray-900">{customer.contact}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-medium text-gray-900">{customer.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Loan Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500">Principal Amount</p>
                  <p className="text-lg font-semibold text-gray-900">Rs {customer.loanAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Interest Rate</p>
                  <p className="text-lg font-semibold text-gray-900">{customer.interestRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-lg font-semibold text-gray-900">{customer.loanDuration} months</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Monthly Payment</p>
                  <p className="text-lg font-semibold text-gray-900">Rs {customer.monthlySettlement.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Payment Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {paymentProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${paymentProgress}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Amount Paid</p>
                    <p className="text-lg font-semibold text-green-600">Rs {paidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Remaining Balance</p>
                    <p className="text-lg font-semibold text-orange-600">Rs {customer.remainingBalance.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
              </div>
              {transactions.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.type === 'payment'
                              ? 'bg-green-100'
                              : 'bg-blue-100'
                          }`}>
                            {transaction.type === 'payment' ? (
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            ) : (
                              <DollarSign className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.type === 'payment' ? 'Payment Received' : 'Loan Disbursed'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${
                            transaction.type === 'payment' ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            Rs {transaction.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Balance: Rs {transaction.balanceAfter.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  No transactions yet
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <Link
                to="/collections"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors mb-3"
              >
                <DollarSign className="w-5 h-5" />
                Add Payment
              </Link>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className={`px-4 py-3 rounded-lg ${
                  customer.status === 'active'
                    ? 'bg-green-50'
                    : customer.status === 'completed'
                    ? 'bg-blue-50'
                    : 'bg-red-50'
                }`}>
                  <p className="text-xs text-gray-600 mb-1">Loan Status</p>
                  <p className={`text-sm font-semibold ${
                    customer.status === 'active'
                      ? 'text-green-800'
                      : customer.status === 'completed'
                      ? 'text-blue-800'
                      : 'text-red-800'
                  }`}>
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
