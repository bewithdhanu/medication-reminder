import React, { useState } from 'react';
import { Clock, Calendar, Pause, Play, Edit, Trash, ChevronRight, ChevronDown } from 'lucide-react';
import { ReminderSchedule, ReminderNotification } from '../types';
import { formatDateTime, formatTime, formatDate, getFrequencyText, formatReminderNotification } from '../utils/reminderHelpers';

interface ReminderItemProps {
  schedule: ReminderSchedule;
  upcomingReminders: ReminderNotification[];
  onEdit: (id: string) => void;
  onTogglePause: (id: string) => void;
  onDelete: (id: string) => void;
}

const ReminderItem: React.FC<ReminderItemProps> = ({
  schedule,
  upcomingReminders,
  onEdit,
  onTogglePause,
  onDelete
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const getStatusLabel = () => {
    if (schedule.isPaused) {
      return <span className="text-orange-500 font-medium">Paused</span>;
    }
    return <span className="text-emerald-500 font-medium">Active</span>;
  };

  const formatReminderTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
        schedule.isPaused ? 'border-l-4 border-orange-400' : 'border-l-4 border-emerald-400'
      }`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{schedule.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {getFrequencyText(schedule)}
            </p>
          </div>
          <div className="flex items-center">
            {getStatusLabel()}
            <button 
              onClick={() => setExpanded(!expanded)}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>
        
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Starts: {formatDateTime(schedule.startDate, schedule.startTime)}</span>
        </div>
        
        {schedule.endDate && (
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Ends: {formatDate(schedule.endDate)}</span>
          </div>
        )}
        
        {!schedule.remindAnytime && (
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Only between {formatTime(schedule.dailyStartTime || '')} - {formatTime(schedule.dailyEndTime || '')}</span>
          </div>
        )}
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="mt-3 border-t border-gray-100 pt-3">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Upcoming Reminders:</h4>
            {upcomingReminders.length > 0 ? (
              <ul className="space-y-1">
                {upcomingReminders.map(reminder => (
                  <li key={reminder.id} className="text-sm text-gray-600 flex items-center">
                    <Clock className="h-3 w-3 mr-2 text-blue-500" />
                    {formatReminderNotification(reminder)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No upcoming reminders</p>
            )}
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => onTogglePause(schedule.id)}
              className={`inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
                schedule.isPaused
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              {schedule.isPaused ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
              {schedule.isPaused ? 'Resume' : 'Pause'}
            </button>
            
            <button
              onClick={() => onEdit(schedule.id)}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </button>
            
            <button
              onClick={() => onDelete(schedule.id)}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              <Trash className="h-3 w-3 mr-1" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderItem;