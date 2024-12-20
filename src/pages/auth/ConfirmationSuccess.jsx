import React from 'react';
import { Link } from 'react-router-dom';

const ConfirmationSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Confirmed!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your email has been successfully confirmed. You can now log in to your account.
          </p>
        </div>
        <div>
          <Link
            to="/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0D344C] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D344C]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationSuccess; 