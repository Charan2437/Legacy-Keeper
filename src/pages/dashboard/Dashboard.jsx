import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Add handler for reminder button
  const handleReminderClick = () => {
    navigate('/reminders');
  };

  return (
    <div className="w-full">
      {/* ... other dashboard content ... */}
      
      {/* Update the reminder button */}
      <button 
        onClick={handleReminderClick}
        className="flex items-center gap-2 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
      >
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium">Reminders</h3>
          <p className="text-sm text-gray-600">Set and manage your reminders</p>
        </div>
        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* ... other dashboard content ... */}
    </div>
  );
};

export default Dashboard; 