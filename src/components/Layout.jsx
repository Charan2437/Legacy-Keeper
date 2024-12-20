import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children, userName }) => {
  return (
    <div className="flex min-h-screen">
      <div className="fixed h-screen">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col ml-64 bg-gray-50">
        <Navbar userName={userName} />
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;