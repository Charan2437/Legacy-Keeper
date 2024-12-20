import React from 'react';

const Pagination = ({ 
  totalItems, 
  itemsPerPage, 
  currentPage, 
  onPageChange,
  onItemsPerPageChange 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePrevClick = () => {
    if (currentPage === 1) {
      onPageChange(totalPages); // Go to last page if at first page
    } else {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage === totalPages) {
      onPageChange(1); // Go to first page if at last page
    } else {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 0) return null;

  return (
    <div className="flex justify-between items-center mt-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{itemsPerPage}</span>
        <span className="text-sm text-gray-500">Items per page</span>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={handlePrevClick}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
        >
          ‹
        </button>
        
        {getPageNumbers().map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${
              currentPage === pageNum 
                ? 'bg-[#0D344C] text-white' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button 
          onClick={handleNextClick}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination; 