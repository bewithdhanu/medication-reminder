export type FrequencyUnit = 'hours' | 'days' | 'weeks' | 'months' | 'weekly';

export type Weekday = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface ReminderSchedule {
  id: string;
  name: string;
  startDate: string; // ISO date string
  startTime: string; // HH:MM format
  frequency: number;
  frequencyUnit: FrequencyUnit;
  endDate: string | null; // ISO date string or null if no end date
  remindAnytime: boolean;
  dailyStartTime: string | null; // HH:MM format or null if remindAnytime
  dailyEndTime: string | null; // HH:MM format or null if remindAnytime
  dayOfMonth: number | null; // 1-31 or null if not monthly
  selectedWeekdays: Weekday[]; // Array of selected weekdays
  isPaused: boolean;
  lastUpdated: string; // ISO date string
}

export interface ReminderNotification {
  id: string;
  scheduleId: string;
  scheduledTime: string; // ISO date-time string
  triggered: boolean;
}