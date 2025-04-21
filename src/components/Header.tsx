import React from 'react';
import { Clock, Pill } from 'lucide-react';

interface HeaderProps {
  onNewReminder: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewReminder }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Pill className="h-8 w-8 text-blue-500 mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">MedRemind</h1>
          </div>
          
          <button
            onClick={onNewReminder}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-150"
          >
            <Clock className="h-4 w-4" />
            <span>New Reminder</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;