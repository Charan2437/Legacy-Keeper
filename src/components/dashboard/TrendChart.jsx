import React from 'react';
import { Line } from 'react-chartjs-2';

const TrendChart = () => {
  const data = {
    labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    datasets: [
      {
        label: 'Debts',
        data: [65, 59, 80, 81, 56, 55, 72, 60, 67, 58, 63, 69],
        borderColor: '#EF4444',
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'Investments',
        data: [28, 48, 40, 45, 46, 27, 38, 32, 33, 35, 30, 34],
        borderColor: '#10B981',
        tension: 0.4,
        pointRadius: 0,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 h-[271px]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600">Debts</span>
          </div>
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600">Investments</span>
          </div>
        </div>
        <select className="text-sm text-gray-600 border rounded-md px-3 py-1.5 outline-none">
          <option>Monthly</option>
          <option>Yearly</option>
        </select>
      </div>
      <div className="h-[180px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default TrendChart;