import React from 'react';

const DeleteModal = ({ isOpen, onClose, onDelete, nomineeName, type = "nominee" }) => {
  const entityType = type === 'trustee' ? 'Trustee' : 'Nominee';
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Delete {entityType} {nomineeName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center py-8">
          <div className="mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg 
                className="w-6 h-6 text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-8">
            Are you sure you want to<br />Delete this {entityType}?
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 min-w-[120px]"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="px-6 py-2 bg-[#0D344C] text-white rounded text-sm hover:bg-opacity-90 min-w-[120px]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal; 