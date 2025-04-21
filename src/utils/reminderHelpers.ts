import { ReminderSchedule, ReminderNotification, Weekday } from '../types';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Format date to display format with weekday
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format time to display format
export const formatTime = (timeStr: string): string => {
  // Convert 24h format to 12h format
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Format date and time together
export const formatDateTime = (dateStr: string, timeStr: string): string => {
  return `${formatDate(dateStr)} at ${formatTime(timeStr)}`;
};

// Check if a time falls within the daily constraints
const isWithinDailyConstraints = (
  time: Date,
  dailyStartTime: string | null,
  dailyEndTime: string | null,
  remindAnytime: boolean
): boolean => {
  if (remindAnytime) {
    return true;
  }

  if (!dailyStartTime || !dailyEndTime) {
    return true;
  }

  const timeHours = time.getHours();
  const timeMinutes = time.getMinutes();
  
  const [startHours, startMinutes] = dailyStartTime.split(':').map(Number);
  const [endHours, endMinutes] = dailyEndTime.split(':').map(Number);
  
  const timeValue = timeHours * 60 + timeMinutes;
  const startValue = startHours * 60 + startMinutes;
  const endValue = endHours * 60 + endMinutes;
  
  return timeValue >= startValue && timeValue <= endValue;
};

// Find the next valid time within daily constraints
const findNextValidTime = (
  time: Date,
  dailyStartTime: string,
  dailyEndTime: string,
  frequency: number
): Date => {
  const [startHours, startMinutes] = dailyStartTime.split(':').map(Number);
  const [endHours, endMinutes] = dailyEndTime.split(':').map(Number);
  
  const nextTime = new Date(time);
  const timeValue = time.getHours() * 60 + time.getMinutes();
  const startValue = startHours * 60 + startMinutes;
  const endValue = endHours * 60 + endMinutes;
  
  if (timeValue > endValue) {
    // If time is after end time (e.g. 11:00 PM), move to start time of next day
    nextTime.setDate(nextTime.getDate() + 1);
    nextTime.setHours(startHours, startMinutes, 0, 0);
  } else if (timeValue < startValue) {
    // If time is before start time (e.g. 2:00 AM), move to start time of same day
    nextTime.setHours(startHours, startMinutes, 0, 0);
  }
  
  return nextTime;
};

// Check if a date is one of the selected weekdays
const isSelectedWeekday = (date: Date, selectedWeekdays: Weekday[]): boolean => {
  const weekdays: Weekday[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return selectedWeekdays.includes(weekdays[date.getDay()]);
};

// Find the next selected weekday from a given date
const findNextSelectedWeekday = (date: Date, selectedWeekdays: Weekday[]): Date => {
  const result = new Date(date);
  while (!isSelectedWeekday(result, selectedWeekdays)) {
    result.setDate(result.getDate() + 1);
  }
  return result;
};

// Find the next valid monthly date
const findNextMonthlyDate = (
  baseDate: Date,
  targetDay: number,
  startTime: { hours: number; minutes: number }
): Date => {
  const result = new Date(baseDate);
  
  // If we haven't reached the target day this month yet, use this month
  if (baseDate.getDate() <= targetDay) {
    result.setDate(targetDay);
  } else {
    // Move to the target day of next month
    result.setMonth(result.getMonth() + 1);
    result.setDate(targetDay);
  }
  
  // Set the original time
  result.setHours(startTime.hours, startTime.minutes, 0, 0);
  return result;
};

// Calculate the next valid reminder time based on schedule
export const calculateNextReminderTime = (
  schedule: ReminderSchedule,
  lastReminderTime: Date | null = null
): Date | null => {
  if (schedule.isPaused) {
    return null;
  }

  // Handle weekly frequency by converting it to weeks with frequency=1
  const normalizedSchedule = {
    ...schedule,
    frequency: schedule.frequencyUnit === 'weekly' ? 1 : schedule.frequency,
    frequencyUnit: schedule.frequencyUnit === 'weekly' ? 'weeks' : schedule.frequencyUnit
  };

  // Ensure proper parsing of the start date and time
  const [startHours, startMinutes] = normalizedSchedule.startTime.split(':').map(Number);
  const startDateTime = new Date(normalizedSchedule.startDate);
  startDateTime.setHours(startHours, startMinutes, 0, 0);
  
  // Special handling for monthly reminders
  if (normalizedSchedule.frequencyUnit === 'months' && normalizedSchedule.dayOfMonth) {
    const now = new Date();
    const targetDay = normalizedSchedule.dayOfMonth;
    
    if (!lastReminderTime) {
      // For first reminder, find the first occurrence of the target day
      const firstReminder = findNextMonthlyDate(
        startDateTime > now ? startDateTime : now,
        targetDay,
        { hours: startHours, minutes: startMinutes }
      );
      return firstReminder;
    } else {
      // For subsequent reminders, add the frequency months to the last reminder
      const nextTime = new Date(lastReminderTime);
      nextTime.setMonth(nextTime.getMonth() + normalizedSchedule.frequency);
      // Ensure we maintain the correct day and time
      nextTime.setDate(targetDay);
      nextTime.setHours(startHours, startMinutes, 0, 0);
      return nextTime;
    }
  }

  // If this is the first calculation and the start time is in the future, use it
  if (!lastReminderTime) {
    const now = new Date();
    if (startDateTime > now) {
      // For daily frequency, ensure it's a selected weekday
      if (normalizedSchedule.frequencyUnit === 'days') {
        if (!isSelectedWeekday(startDateTime, normalizedSchedule.selectedWeekdays)) {
          return findNextSelectedWeekday(startDateTime, normalizedSchedule.selectedWeekdays);
        }
      }
      return startDateTime;
    }

    // For daily/weekly/monthly frequencies, always use the start time of day
    if (normalizedSchedule.frequencyUnit !== 'hours') {
      const daysDiff = Math.floor((now.getTime() - startDateTime.getTime()) / (24 * 60 * 60 * 1000));
      const daysToAdd = normalizedSchedule.frequencyUnit === 'days' ? normalizedSchedule.frequency :
                       normalizedSchedule.frequencyUnit === 'weeks' ? normalizedSchedule.frequency * 7 : 0;
      
      if (daysToAdd > 0) {
        const periodsElapsed = Math.floor(daysDiff / daysToAdd);
        const nextTime = new Date(startDateTime);
        nextTime.setDate(startDateTime.getDate() + (periodsElapsed + 1) * daysToAdd);
        
        // For daily frequency, ensure it's a selected weekday
        if (normalizedSchedule.frequencyUnit === 'days') {
          if (!isSelectedWeekday(nextTime, normalizedSchedule.selectedWeekdays)) {
            return findNextSelectedWeekday(nextTime, normalizedSchedule.selectedWeekdays);
          }
        }
        
        return nextTime;
      }
    }

    // For hourly frequency, calculate based on elapsed time
    const diffMs = now.getTime() - startDateTime.getTime();
    const intervalMs = normalizedSchedule.frequency * 60 * 60 * 1000;
    const intervals = Math.floor(diffMs / intervalMs);
    const nextIntervalTime = new Date(startDateTime.getTime() + (intervals + 1) * intervalMs);
    
    // If not reminding anytime, ensure the time is within daily constraints
    if (!normalizedSchedule.remindAnytime && normalizedSchedule.dailyStartTime && normalizedSchedule.dailyEndTime) {
      if (!isWithinDailyConstraints(nextIntervalTime, normalizedSchedule.dailyStartTime, normalizedSchedule.dailyEndTime, normalizedSchedule.remindAnytime)) {
        return findNextValidTime(nextIntervalTime, normalizedSchedule.dailyStartTime, normalizedSchedule.dailyEndTime, normalizedSchedule.frequency);
      }
    }
    
    return nextIntervalTime;
  }

  // Start from the last reminder
  const baseTime = lastReminderTime;
  let nextTime = new Date(baseTime);
  
  // Calculate next time based on frequency unit
  switch (normalizedSchedule.frequencyUnit) {
    case 'hours':
      nextTime.setHours(nextTime.getHours() + normalizedSchedule.frequency);
      nextTime.setMinutes(startDateTime.getMinutes());
      nextTime.setSeconds(0, 0);
      
      // If not reminding anytime, ensure the time is within daily constraints
      if (!normalizedSchedule.remindAnytime && normalizedSchedule.dailyStartTime && normalizedSchedule.dailyEndTime) {
        if (!isWithinDailyConstraints(nextTime, normalizedSchedule.dailyStartTime, normalizedSchedule.dailyEndTime, normalizedSchedule.remindAnytime)) {
          return findNextValidTime(nextTime, normalizedSchedule.dailyStartTime, normalizedSchedule.dailyEndTime, normalizedSchedule.frequency);
        }
      }
      break;
    case 'days':
      // For daily reminders, find the next selected weekday
      nextTime.setDate(nextTime.getDate() + normalizedSchedule.frequency);
      nextTime.setHours(startDateTime.getHours());
      nextTime.setMinutes(startDateTime.getMinutes());
      nextTime.setSeconds(0, 0);
      
      // If it's not a selected weekday, find the next one
      if (!isSelectedWeekday(nextTime, normalizedSchedule.selectedWeekdays)) {
        return findNextSelectedWeekday(nextTime, normalizedSchedule.selectedWeekdays);
      }
      break;
    case 'weeks':
      nextTime.setDate(nextTime.getDate() + (normalizedSchedule.frequency * 7));
      // Maintain same time of day
      nextTime.setHours(startDateTime.getHours(), startDateTime.getMinutes(), 0, 0);
      break;
    case 'months':
      // For monthly, we need to handle the day of month
      const targetDay = normalizedSchedule.dayOfMonth || startDateTime.getDate();
      let month = nextTime.getMonth() + normalizedSchedule.frequency;
      const year = nextTime.getFullYear() + Math.floor(month / 12);
      month = month % 12;
      
      // Create date with target day, handle overflow
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const day = Math.min(targetDay, daysInMonth);
      
      nextTime = new Date(year, month, day);
      nextTime.setHours(startDateTime.getHours(), startDateTime.getMinutes(), 0, 0);
      break;
  }
  
  // Check end date constraint
  if (normalizedSchedule.endDate && new Date(normalizedSchedule.endDate) < nextTime) {
    return null;
  }
  
  return nextTime;
};

// Generate next few upcoming reminders based on a schedule
export const generateUpcomingReminders = (
  schedule: ReminderSchedule,
  count: number = 10
): ReminderNotification[] => {
  const reminders: ReminderNotification[] = [];
  let lastTime: Date | null = null;
  
  for (let i = 0; i < count; i++) {
    const nextTime = calculateNextReminderTime(schedule, lastTime);
    if (!nextTime) break;
    
    lastTime = nextTime;
    reminders.push({
      id: generateId(),
      scheduleId: schedule.id,
      scheduledTime: nextTime.toISOString(),
      triggered: false
    });
  }
  
  return reminders;
};

// Get formatted frequency text
export const getFrequencyText = (schedule: ReminderSchedule): string => {
  const { frequency, frequencyUnit, dayOfMonth, selectedWeekdays = [] } = schedule;

  if (frequencyUnit === 'weekly' || (frequencyUnit === 'days' && selectedWeekdays?.length < 7)) {
    // Format selected weekdays
    const weekdayLabels = (selectedWeekdays || [])
      .map(day => day.charAt(0).toUpperCase() + day.slice(1))
      .join(', ');
    return `Every ${frequencyUnit === 'weekly' ? 'week' : 'day'}${weekdayLabels ? ' on ' + weekdayLabels : ''}`;
  }

  if (frequencyUnit === 'months' && dayOfMonth) {
    // Add ordinal suffix to the day
    const ordinal = (n: number): string => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    return `Every month on the ${ordinal(dayOfMonth)}`;
  }

  if (frequency === 1) {
    // Handle singular forms
    return `Every ${frequencyUnit.slice(0, -1)}`; // Remove 's' for singular
  }
  return `Every ${frequency} ${frequencyUnit}`;
};

// Format reminder notification
export const formatReminderNotification = (notification: ReminderNotification): string => {
  const date = new Date(notification.scheduledTime);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};