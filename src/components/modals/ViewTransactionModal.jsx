import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { transactionService } from '../../services/transactions';
import { useAuth } from '../../contexts/AuthContext';

const ViewTransactionModal = ({ isOpen, onClose, transaction, onUpdate }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newDocument, setNewDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState(null);

  useEffect(() => {
    const getSignedUrl = async () => {
      if (transaction && transaction.document_url) {
        try {
          setLoading(true);
          const url = await transactionService.getSignedUrl(transaction.document_url);
          setSignedUrl(url);
        } catch (error) {
          console.error('Error getting signed URL:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    getSignedUrl();
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewDocument(file);
    }
  };

  const handleRemoveDocument = async () => {
    try {
      setLoading(true);
      await transactionService.updateTransaction(transaction.id, {
        ...transaction,
        document_url: null
      });
      onUpdate({ ...transaction, document_url: null });
      setIsEditing(false);
    } catch (error) {
      console.error('Error removing document:', error);
      alert('Failed to remove document');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDocument = async () => {
    try {
      setLoading(true);
      if (!newDocument) return;

      const document_url = await transactionService.uploadDocument(newDocument, user.id);
      await transactionService.updateTransaction(transaction.id, {
        ...transaction,
        document_url
      });
      onUpdate({ ...transaction, document_url });
      setIsEditing(false);
      setNewDocument(null);
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Failed to update document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">View Transaction Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Transaction Name</h3>
              <p className="mt-1">{transaction.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Person/Party</h3>
              <p className="mt-1">{transaction.person_party}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount</h3>
              <p className="mt-1">{formatCurrency(transaction.amount)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Type</h3>
              <p className="mt-1">{transaction.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Payment Mode</h3>
              <p className="mt-1">{transaction.payment_mode}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date</h3>
              <p className="mt-1">{new Date(transaction.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Document Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Attached Document</h3>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0D344C]"></div>
              </div>
            ) : isEditing ? (
              <div className="space-y-4">
                <input
                  type="file"
                  onChange={handleDocumentChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#0D344C] file:text-white
                    hover:file:bg-opacity-90"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateDocument}
                    disabled={!newDocument}
                    className={`px-4 py-2 rounded-lg ${
                      newDocument 
                        ? 'bg-[#0D344C] text-white hover:bg-opacity-90'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Update Document
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNewDocument(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {transaction.document_url && signedUrl ? (
                  <>
                    <div className="border rounded-lg p-4">
                      {transaction.document_url.toLowerCase().endsWith('.pdf') ? (
                        <object
                          data={signedUrl}
                          type="application/pdf"
                          className="w-full h-[500px]"
                        >
                          <div className="text-center py-4">
                            <p className="text-gray-500 mb-2">Unable to display PDF directly</p>
                            <a
                              href={signedUrl}
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
                          src={signedUrl}
                          alt="Transaction Document"
                          className="max-w-full h-auto"
                        />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90"
                      >
                        View Document
                      </a>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90"
                      >
                        Replace Document
                      </button>
                      <button
                        onClick={handleRemoveDocument}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Remove Document
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-2">No document attached</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90"
                    >
                      Add Document
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
  );
};

export default ViewTransactionModal; 