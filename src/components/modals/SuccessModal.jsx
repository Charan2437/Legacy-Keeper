import React from 'react';

const SuccessModal = ({ isOpen, onClose, message, type = "nominee" }) => {
  if (!isOpen) return null;

  const getMessage = () => {
    const entityType = type === 'insurance' ? 'Insurance' : 'Nominee';
    switch (message) {
      case 'added':
        return `${entityType} Added Successfully`;
      case 'edited':
        return `${entityType} Updated Successfully`;
      case 'deleted':
        return `${entityType} Deleted Successfully`;
      default:
        return `${entityType} Operation Successful`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Success</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center py-8">
          <div className="mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg 
                className="w-6 h-6 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            {getMessage()}
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#0D344C] text-white rounded text-sm hover:bg-opacity-90 min-w-[120px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal; 