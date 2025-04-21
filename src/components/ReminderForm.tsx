import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { ReminderSchedule, FrequencyUnit, Weekday } from '../types';
import { generateId } from '../utils/reminderHelpers';

interface ReminderFormProps {
  onClose: () => void;
  onSave: (schedule: Omit<ReminderSchedule, 'id' | 'isPaused' | 'lastUpdated'>) => void;
  scheduleToEdit?: ReminderSchedule;
}

const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const defaultTime = '09:00'; // 9:00 AM

const WEEKDAYS: { id: Weekday; label: string }[] = [
  { id: 'sunday', label: 'Sun' },
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
];

const ReminderForm: React.FC<ReminderFormProps> = ({ onClose, onSave, scheduleToEdit }) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState(defaultTime);
  const [frequency, setFrequency] = useState(1);
  const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit>('days');
  const [endDate, setEndDate] = useState<string>('');
  const [remindAnytime, setRemindAnytime] = useState(true);
  const [dailyStartTime, setDailyStartTime] = useState('08:00');
  const [dailyEndTime, setDailyEndTime] = useState('22:00');
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(null);
  const [selectedWeekdays, setSelectedWeekdays] = useState<Weekday[]>(WEEKDAYS.map(d => d.id));
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load schedule data if editing
  useEffect(() => {
    if (scheduleToEdit) {
      setName(scheduleToEdit.name);
      setStartDate(scheduleToEdit.startDate);
      setStartTime(scheduleToEdit.startTime);
      setFrequency(scheduleToEdit.frequency);
      setFrequencyUnit(scheduleToEdit.frequencyUnit);
      setEndDate(scheduleToEdit.endDate || '');
      setRemindAnytime(scheduleToEdit.remindAnytime);
      setDailyStartTime(scheduleToEdit.dailyStartTime || '08:00');
      setDailyEndTime(scheduleToEdit.dailyEndTime || '22:00');
      setDayOfMonth(scheduleToEdit.dayOfMonth);
      setSelectedWeekdays(scheduleToEdit.selectedWeekdays);
    }
  }, [scheduleToEdit]);

  // Update dayOfMonth when frequencyUnit changes to 'months'
  useEffect(() => {
    if (frequencyUnit === 'months' && !dayOfMonth) {
      // Default to the day from the start date
      const startDayOfMonth = new Date(startDate).getDate();
      setDayOfMonth(startDayOfMonth);
    }
  }, [frequencyUnit, dayOfMonth, startDate]);

  // Update frequency when switching to/from weekly
  useEffect(() => {
    if (frequencyUnit === 'weekly') {
      setFrequency(1);
    }
  }, [frequencyUnit]);

  const toggleWeekday = (weekday: Weekday) => {
    setSelectedWeekdays(prev => {
      if (prev.includes(weekday)) {
        // Don't allow deselecting if it's the last selected day
        if (prev.length === 1) return prev;
        return prev.filter(day => day !== weekday);
      }
      return [...prev, weekday];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Record<string, string> = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!startTime) {
      errors.startTime = 'Start time is required';
    }
    
    if (frequency <= 0 && frequencyUnit !== 'weekly') {
      errors.frequency = 'Frequency must be greater than 0';
    }
    
    if (!remindAnytime) {
      if (!dailyStartTime) {
        errors.dailyStartTime = 'Daily start time is required';
      }
      
      if (!dailyEndTime) {
        errors.dailyEndTime = 'Daily end time is required';
      }
      
      if (dailyStartTime && dailyEndTime && dailyStartTime >= dailyEndTime) {
        errors.dailyTimeRange = 'End time must be after start time';
      }
    }
    
    if (frequencyUnit === 'months' && (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31)) {
      errors.dayOfMonth = 'Please select a valid day of month (1-31)';
    }

    if ((frequencyUnit === 'days' || frequencyUnit === 'weekly') && selectedWeekdays.length === 0) {
      errors.weekdays = 'Please select at least one weekday';
    }
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      // Form is valid, save the schedule
      onSave({
        name,
        startDate,
        startTime,
        frequency: frequencyUnit === 'weekly' ? 1 : frequency,
        frequencyUnit: frequencyUnit === 'weekly' ? 'weeks' : frequencyUnit,
        endDate: endDate || null,
        remindAnytime,
        dailyStartTime: remindAnytime ? null : dailyStartTime,
        dailyEndTime: remindAnytime ? null : dailyEndTime,
        dayOfMonth: frequencyUnit === 'months' ? dayOfMonth : null,
        selectedWeekdays
      });
      
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {scheduleToEdit ? 'Edit Reminder' : 'New Reminder'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Morning Medication"
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {validationErrors.startDate && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.startDate}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {validationErrors.startTime && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.startTime}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Repeat Every
              </label>
              <div className="flex">
                <input
                  type="number"
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-1/3 rounded-l-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={frequencyUnit}
                  onChange={(e) => setFrequencyUnit(e.target.value as FrequencyUnit)}
                  className="w-2/3 rounded-r-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
              {validationErrors.frequency && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.frequency}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {frequencyUnit === 'months' && (
            <div>
              <label htmlFor="dayOfMonth" className="block text-sm font-medium text-gray-700 mb-1">
                Day of Month
              </label>
              <select
                id="dayOfMonth"
                value={dayOfMonth || ''}
                onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a day</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              {validationErrors.dayOfMonth && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.dayOfMonth}</p>
              )}
            </div>
          )}
          
          {frequencyUnit === 'days' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repeat on
              </label>
              <div className="flex gap-1">
                {WEEKDAYS.map(day => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleWeekday(day.id)}
                    className={`
                      px-3 py-2 rounded-md text-sm font-medium
                      ${selectedWeekdays.includes(day.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                      transition-colors duration-200
                    `}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {validationErrors.weekdays && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.weekdays}</p>
              )}
            </div>
          )}
          
          <div className="pt-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="remindAnytime"
                  type="checkbox"
                  checked={remindAnytime}
                  onChange={(e) => setRemindAnytime(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="remindAnytime" className="font-medium text-gray-700">
                  Remind anytime (24 hours)
                </label>
                <p className="text-gray-500">
                  Reminders will be sent at any time of day based on the frequency
                </p>
              </div>
            </div>
          </div>
          
          {!remindAnytime && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label htmlFor="dailyStartTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Start Time
                </label>
                <input
                  type="time"
                  id="dailyStartTime"
                  value={dailyStartTime}
                  onChange={(e) => setDailyStartTime(e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {validationErrors.dailyStartTime && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.dailyStartTime}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="dailyEndTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Daily End Time
                </label>
                <input
                  type="time"
                  id="dailyEndTime"
                  value={dailyEndTime}
                  onChange={(e) => setDailyEndTime(e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {validationErrors.dailyEndTime && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.dailyEndTime}</p>
                )}
              </div>
            </div>
          )}
          
          {validationErrors.dailyTimeRange && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-600">{validationErrors.dailyTimeRange}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {scheduleToEdit ? 'Update' : 'Create'} Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderForm;