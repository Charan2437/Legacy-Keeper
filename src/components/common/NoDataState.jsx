import React from 'react';

const NoDataState = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
      <div className="max-w-[420px] text-center">
        <div className="mb-6">
          <svg 
            className="w-16 h-16 mx-auto text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-500 mb-8">
          {description}
        </p>
        <button
          onClick={onAction}
          className="w-full px-4 py-2 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90 transition-all"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default NoDataState; 