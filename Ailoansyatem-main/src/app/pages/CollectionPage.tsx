import { useState, useEffect } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import { addPayment, getCustomers } from '../lib/api';
import { Customer } from '../types';
import { toast } from 'sonner';

export function CollectionPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

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

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      toast.error('Payment amount must be greater than 0');
      return;
    }

    if (amount > selectedCustomer.remainingBalance) {
      toast.error('Payment amount cannot exceed remaining balance');
      return;
    }

    const balanceBefore = selectedCustomer.remainingBalance;
    const balanceAfter = balanceBefore - amount;

    try {
      await addPayment({
        customerId: selectedCustomer.id,
        amount,
        date: new Date(paymentDate).toISOString(),
      });

      toast.success(`Payment of $${amount.toLocaleString()} recorded successfully!`);
      setSelectedCustomer(null);
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      loadCustomers();
    } catch (error) {
      console.error('Failed to record payment', error);
      toast.error('Payment could not be recorded. Please try again.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Collection Management</h1>
        <p className="text-sm text-gray-500 mt-1">Record customer loan repayments and installments</p>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Search Customer</h3>
            </div>
            <div className="p-6">
              <div className="relative mb-4">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or contact..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {searchQuery && (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedCustomer?.id === customer.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.contact}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Remaining</p>
                            <p className="font-semibold text-orange-600">
                              ${customer.remainingBalance.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No customers found</p>
                  )}
                </div>
              )}

              {!searchQuery && (
                <div className="text-center text-gray-500 py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p>Search for a customer to add a payment</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Payment</h3>
            </div>
            <div className="p-6">
              {selectedCustomer ? (
                <form onSubmit={handleAddPayment} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700 mb-2">Selected Customer</p>
                    <p className="font-semibold text-blue-900">{selectedCustomer.name}</p>
                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-blue-200">
                      <div>
                        <p className="text-xs text-blue-700">Total Loan</p>
                        <p className="font-medium text-blue-900">
                          ${selectedCustomer.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">Remaining</p>
                        <p className="font-medium text-orange-600">
                          ${selectedCustomer.remainingBalance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={selectedCustomer.remainingBalance}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter payment amount"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum: ${selectedCustomer.remainingBalance.toLocaleString()}
                    </p>
                  </div>

                  {paymentAmount && parseFloat(paymentAmount) > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-700 mb-2">New Balance</p>
                      <p className="text-2xl font-semibold text-green-900">
                        ${(selectedCustomer.remainingBalance - parseFloat(paymentAmount)).toLocaleString()}
                      </p>
                      {selectedCustomer.remainingBalance - parseFloat(paymentAmount) === 0 && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-green-200">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <p className="text-sm font-medium text-green-800">
                            This payment will complete the loan!
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(null);
                        setPaymentAmount('');
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Record Payment
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <p>Select a customer from the search results to add a payment</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
