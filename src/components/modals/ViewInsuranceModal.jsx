import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { insuranceService } from '../../services/insurance';

const ViewInsuranceModal = ({ isOpen, onClose, insurance, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [governmentIdUrl, setGovernmentIdUrl] = useState(null);

  useEffect(() => {
    const getSignedUrl = async () => {
      if (insurance?.government_id) {
        try {
          setLoading(true);
          const url = await insuranceService.getSignedUrl(insurance.government_id);
          setGovernmentIdUrl(url);
        } catch (error) {
          console.error('Error getting signed URL:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen && insurance) {
      getSignedUrl();
    }
  }, [isOpen, insurance]);

  if (!isOpen || !insurance) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">View Insurance Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Insurance Details */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Insurance Name</h3>
                <p className="mt-1">{insurance.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Insurance Type</h3>
                <p className="mt-1">{insurance.insurance_types.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                <p className="mt-1">{formatCurrency(insurance.amount)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Paid To</h3>
                <p className="mt-1">{insurance.paid_to}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Insurance Date</h3>
                <p className="mt-1">{new Date(insurance.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Coverage Period</h3>
                <p className="mt-1">{insurance.coverage_period} months</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 whitespace-pre-wrap">{insurance.description}</p>
            </div>

            {/* Government ID Document */}
            {insurance.government_id && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Government ID</h3>
                {loading ? (
                  <div className="text-center py-4">Loading document...</div>
                ) : governmentIdUrl ? (
                  <div className="border rounded-lg p-4">
                    {insurance.government_id.toLowerCase().endsWith('.pdf') ? (
                      <object
                        data={governmentIdUrl}
                        type="application/pdf"
                        className="w-full h-[500px]"
                      >
                        <div className="text-center py-4">
                          <p className="text-gray-500 mb-2">Unable to display PDF directly</p>
                          <a
                            href={governmentIdUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0D344C] hover:underline"
                          >
                            Open PDF in new tab
                          </a>
                        </div>
                      </object>
                    ) : (
                      <img
                        src={governmentIdUrl}
                        alt="Government ID"
                        className="max-w-full h-auto"
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Failed to load document
                  </div>
                )}
              </div>
            )}

            {insurance.reminder_enabled && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reminder</h3>
                <p className="mt-1">Enabled</p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end mt-6 pt-4 border-t">
            <button
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

export default ViewInsuranceModal; 