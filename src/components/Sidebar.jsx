import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/images/logo.png'; // Import the logo

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: 'dashboard-icon',
    },
    {
      title: 'Finance',
      isSection: true,
      subItems: [
        { title: 'Transactions', path: '/finance/transactions' },
        { title: 'Debts and Loans', path: '/finance/debts-loans' },
        { title: 'Deposits and Investments', path: '/finance/deposits' },
        { title: 'Document Stores', path: '/finance/documents' },
      ]
    },
    {
      title: 'Family',
      isSection: true,
      subItems: [
        { title: 'Insurance', path: '/family/insurance' },
        { title: 'Health Records', path: '/family/health-records' },
        { title: 'Family Vaults', path: '/family/vaults' },
        { title: 'Digital Accounts and Subscriptions', path: '/family/digital-accounts' },
      ]
    },
    {
      title: 'Financial Planning',
      isSection: true,
      subItems: [
        { title: 'Will and Successions', path: '/planning/will' },
        { title: 'Business Plans', path: '/planning/business' },
        { title: 'Legal Consultation', path: '/planning/legal' },
      ]
    },
    {
      title: 'Reminders',
      path: '/reminders',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col">
      {/* Logo section stays fixed */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <Link to="/" className="flex items-center">
          <img 
            src={logo} 
            alt="Trustee Hub" 
            className="h-8 object-contain"
          />
        </Link>
      </div>

      {/* Scrollable navigation section */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide p-4">
        {menuItems.map((item) => (
          <div key={item.title} className="mb-4">
            {item.isSection ? (
              // Section header - not clickable
              <div className="flex items-center p-2 text-gray-700 font-medium">
                <span>{item.title}</span>
              </div>
            ) : (
              // Regular menu item - clickable
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-lg ${
                  isActive(item.path)
                    ? 'bg-[#0D344C] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{item.title}</span>
              </Link>
            )}

            {item.subItems && (
              <div className="ml-4 mt-2 space-y-2">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    className={`block p-2 rounded-lg ${
                      isActive(subItem.path)
                        ? 'bg-[#0D344C] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {subItem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Updated Logout button */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;