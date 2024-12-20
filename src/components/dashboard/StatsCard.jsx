import React from 'react';
import { useNavigate } from 'react-router-dom';

const StatsCard = ({ title, count, bgColor, icon, path }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`${bgColor} rounded-2xl border-2 p-6 ${path ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 mb-1">{title}</p>
          <h2 className="text-4xl font-bold">{count}</h2>
        </div>
        <div className={`${bgColor} p-4 rounded-2xl bg-opacity-50`}>
          {icon}
        </div>
      </div>
      <button className="text-sm text-gray-500 mt-4 flex items-center">
        View Details
        <svg 
          className="ml-1 w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};

export default StatsCard;