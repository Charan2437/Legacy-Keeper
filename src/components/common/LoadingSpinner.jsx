import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-16 h-16 border-4 border-[#0D344C] border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-600">Loading...</p>
    </div>
  );
};

export default LoadingSpinner; 