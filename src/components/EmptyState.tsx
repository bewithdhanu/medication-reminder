import React from 'react';
import { Clock, Calendar, Plus } from 'lucide-react';

interface EmptyStateProps {
  onNewReminder: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onNewReminder }) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
        <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Clock className="h-8 w-8 text-blue-600" />
        </div>
        
        <h2 className="mt-6 text-2xl font-bold text-gray-900">Welcome to MedRemind</h2>
        
        <p className="mt-3 text-gray-600">
          Your flexible medication reminder system to help you stay on track with your health routine.
        </p>
        
        <div className="mt-8 space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Flexible Scheduling</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create reminders with custom frequencies - hourly, daily, weekly or monthly.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Daily Time Windows</h3>
              <p className="mt-1 text-sm text-gray-500">
                Set "do not disturb" periods to only receive reminders when convenient.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <button
            onClick={onNewReminder}
            className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;