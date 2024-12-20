import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const ViewDebtLoanModal = ({ isOpen, onClose, debtLoan }) => {
  if (!isOpen || !debtLoan) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[700px] p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">View Debt/Loan Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Basic Info Section */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Money {debtLoan.flow_type}</h3>
              <p className="mt-1 text-lg font-medium">{formatCurrency(debtLoan.amount)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Person</h3>
              <p className="mt-1 text-lg">{debtLoan.person_name}</p>
            </div>
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Interest Amount</h3>
              <p className="mt-1">{formatCurrency(debtLoan.interest_amount)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount Due</h3>
              <p className="mt-1">{formatCurrency(debtLoan.amount_due)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Payment Mode</h3>
              <p className="mt-1">{debtLoan.payment_mode}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
              <p className="mt-1">{formatDate(debtLoan.start_date)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
              <p className="mt-1">{formatDate(debtLoan.due_date)}</p>
            </div>
          </div>

          {/* Security */}
          {debtLoan.security && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Security</h3>
              <p className="mt-1">{debtLoan.security}</p>
            </div>
          )}

          {/* Purpose */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Purpose/Description</h3>
            <p className="mt-1">{debtLoan.purpose}</p>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <span className={`inline-flex mt-1 px-2 py-1 rounded-full text-xs font-medium
              ${debtLoan.status === 'Paid' 
                ? 'bg-green-100 text-green-800'
                : debtLoan.status === 'Partially Paid'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
              }`}
            >
              {debtLoan.status}
            </span>
          </div>

          {/* Document */}
          {debtLoan.document_url && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Attached Document</h3>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <a
                  href={debtLoan.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0D344C] hover:underline"
                >
                  View Document
                </a>
              </div>
            </div>
          )}

          {/* Payment History Section */}
          {debtLoan.payments && debtLoan.payments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Payment History</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {debtLoan.payments.map((payment, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{formatDate(payment.payment_date)}</td>
                        <td className="px-4 py-2">{formatCurrency(payment.amount)}</td>
                        <td className="px-4 py-2">{payment.payment_mode}</td>
                        <td className="px-4 py-2">{payment.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDebtLoanModal; 