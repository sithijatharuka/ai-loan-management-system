import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { addPayment } from '../lib/api';

interface AddPaymentModalProps {
  customerId: string;
  remainingBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPaymentModal({
  customerId,
  remainingBalance,
  onClose,
  onSuccess,
}: AddPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const isValidAmount = numericAmount > 0 && numericAmount <= remainingBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidAmount) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await addPayment({
        customerId,
        amount: numericAmount,
        date: date || new Date().toISOString(),
      });

      toast.success('Payment recorded successfully');
      onSuccess();
    } catch (error) {
      console.error('Failed to add payment', error);
      toast.error('Unable to record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add Payment</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount (Rs) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={remainingBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter payment amount"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
              disabled={isSubmitting}
            />
            {amount && (
              <p className="text-xs text-gray-500 mt-1">
                Max available: Rs {remainingBalance.toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              disabled={isSubmitting}
            />
          </div>

          {amount && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900 mb-2">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Payment Amount</span>
                  <span className="font-semibold text-green-900">Rs {numericAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Remaining After Payment</span>
                  <span className="font-semibold text-green-900">
                    Rs {(remainingBalance - numericAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValidAmount}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
