import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { extendLoan } from '../lib/api';

interface ExtendLoanModalProps {
  customerId: string;
  currentLoanAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExtendLoanModal({
  customerId,
  currentLoanAmount,
  onClose,
  onSuccess,
}: ExtendLoanModalProps) {
  const [additionalAmount, setAdditionalAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericAmount = parseFloat(additionalAmount) || 0;
  const isValidAmount = numericAmount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidAmount) {
      toast.error('Please enter a valid additional amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await extendLoan({
        customerId,
        additionalAmount: numericAmount,
      });

      toast.success('Loan extended successfully');
      onSuccess();
    } catch (error) {
      console.error('Failed to extend loan', error);
      toast.error('Unable to extend loan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Extend Loan</h2>
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
              Additional Amount (Rs) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={additionalAmount}
              onChange={(e) => setAdditionalAmount(e.target.value)}
              placeholder="Enter additional loan amount"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Current loan amount: Rs {currentLoanAmount.toLocaleString()}
            </p>
          </div>

          {additionalAmount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Extension Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Additional Amount</span>
                  <span className="font-semibold text-blue-900">Rs {numericAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">New Loan Amount</span>
                  <span className="font-semibold text-blue-900">
                    Rs {(currentLoanAmount + numericAmount).toLocaleString()}
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Extend Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}