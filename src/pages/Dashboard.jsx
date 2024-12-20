import React from 'react';
import StatsCard from '../components/dashboard/StatsCard';
import TrendChart from '../components/dashboard/TrendChart';
import TransactionsTable from '../components/dashboard/TransactionsTable';

const Dashboard = () => {
  return (
    <div className="max-w-[933.5px] mx-auto space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <StatsCard 
          title="Requests" 
          count="06" 
          bgColor="bg-blue-50"
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>} 
        />
        <StatsCard 
          title="Nominees" 
          count="04"
          bgColor="bg-green-50"
          path="/nominees"
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>}
        />
        <StatsCard 
          title="Trustees" 
          count="02"
          bgColor="bg-purple-50"
          path="/trustees"
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>}
        />
      </div>

      {/* Trend Chart */}
      <TrendChart />

      {/* Recent Transactions */}
      <TransactionsTable />
    </div>
  );
};

export default Dashboard;