import { useState, useEffect } from 'react';
import { Search, CheckCircle, TrendingUp } from 'lucide-react';
import { addPayment, getCustomers } from '../lib/api';
import { Customer } from '../types';
import { toast } from 'sonner';
import { AddPaymentModal } from '../components/AddPaymentModal';

export function CollectionPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const allCustomers = await getCustomers();
      const activeCustomers = allCustomers.filter(c => c.status === 'active');
      setCustomers(activeCustomers);
    } catch (error) {
      console.error('Failed to load customers', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.contact.includes(searchQuery)
  );

  const handlePaymentClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Collection Management</h1>
        <p className="text-sm text-gray-500 mt-1">Record customer loan repayments and installments</p>
      </header>

      <main className="p-8">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by customer name or contact..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          </div>

          {filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Contact</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Total Loan</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Remaining Balance</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Progress</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => {
                    const paidAmount = customer.totalAmount - customer.remainingBalance;
                    const referenceAmount = customer.progressReferenceAmount ?? customer.totalAmount;
                    const paymentProgress = (paidAmount / referenceAmount) * 100;
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">ID: {customer.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {customer.contact}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-medium text-gray-900">
                            Rs {customer.totalAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-semibold ${
                            customer.remainingBalance === 0 ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            Rs {customer.remainingBalance.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  paymentProgress === 100 ? 'bg-green-600' : 'bg-blue-600'
                                }`}
                                style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-600 w-10 text-right">
                              {paymentProgress.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handlePaymentClick(customer)}
                            disabled={customer.remainingBalance === 0}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                              customer.remainingBalance === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            <TrendingUp className="w-4 h-4" />
                            Add Payment
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              {customers.length === 0 ? (
                <>
                  <p className="text-lg">No active customers</p>
                  <p className="text-sm mt-1">All customers have completed their loan payments</p>
                </>
              ) : (
                <>
                  <p className="text-lg">No customers match your search</p>
                  <p className="text-sm mt-1">Try adjusting your search criteria</p>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {selectedCustomer && isPaymentModalOpen && (
        <AddPaymentModal
          customerId={selectedCustomer.id || ''}
          remainingBalance={selectedCustomer.remainingBalance}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedCustomer(null);
          }}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            setSelectedCustomer(null);
            loadCustomers();
          }}
        />
      )}
    </div>
  );
}
