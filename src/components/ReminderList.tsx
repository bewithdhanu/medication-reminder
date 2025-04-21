import React from 'react';
import { ReminderSchedule, ReminderNotification } from '../types';
import ReminderItem from './ReminderItem';
import { AlertTriangle } from 'lucide-react';

interface ReminderListProps {
  schedules: ReminderSchedule[];
  getUpcomingReminders: (scheduleId: string) => ReminderNotification[];
  onEdit: (id: string) => void;
  onTogglePause: (id: string) => void;
  onDelete: (id: string) => void;
}

const ReminderList: React.FC<ReminderListProps> = ({
  schedules,
  getUpcomingReminders,
  onEdit,
  onTogglePause,
  onDelete
}) => {
  const activeSchedules = schedules.filter(s => !s.isPaused);
  const pausedSchedules = schedules.filter(s => s.isPaused);

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No reminders yet</h3>
          <p className="text-gray-600">
            Create your first medication reminder to get started with staying on track.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeSchedules.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3">Active Reminders</h2>
          <div className="space-y-4">
            {activeSchedules.map(schedule => (
              <ReminderItem
                key={schedule.id}
                schedule={schedule}
                upcomingReminders={getUpcomingReminders(schedule.id)}
                onEdit={onEdit}
                onTogglePause={onTogglePause}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
      
      {pausedSchedules.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3">Paused Reminders</h2>
          <div className="space-y-4">
            {pausedSchedules.map(schedule => (
              <ReminderItem
                key={schedule.id}
                schedule={schedule}
                upcomingReminders={getUpcomingReminders(schedule.id)}
                onEdit={onEdit}
                onTogglePause={onTogglePause}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderList;