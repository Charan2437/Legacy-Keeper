import React from 'react';

const EmptyState = ({ icon, message, actionButton }) => {
  return (
    <div className="text-center py-12">
      {icon}
      <p className="text-gray-500 mb-2">{message}</p>
      {actionButton}
    </div>
  );
};

export default EmptyState; 