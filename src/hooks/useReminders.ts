import { useState, useEffect } from 'react';
import { ReminderSchedule, ReminderNotification } from '../types';
import { generateId, calculateNextReminderTime, generateUpcomingReminders } from '../utils/reminderHelpers';

// Local storage keys
const SCHEDULES_STORAGE_KEY = 'medicationReminders.schedules';
const NOTIFICATIONS_STORAGE_KEY = 'medicationReminders.notifications';

export const useReminders = () => {
  const [schedules, setSchedules] = useState<ReminderSchedule[]>(() => {
    const saved = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [notifications, setNotifications] = useState<ReminderNotification[]>(() => {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Save schedules to localStorage
  useEffect(() => {
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
  }, [schedules]);
  
  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);
  
  // Check for due notifications every minute
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const updatedNotifications = notifications.map(notification => {
        if (!notification.triggered && new Date(notification.scheduledTime) <= now) {
          // In a real app, we'd trigger the actual notification here
          console.log('Notification triggered:', notification);
          return { ...notification, triggered: true };
        }
        return notification;
      });
      
      if (JSON.stringify(updatedNotifications) !== JSON.stringify(notifications)) {
        setNotifications(updatedNotifications);
      }
    };
    
    // Run immediately and then every minute
    checkNotifications();
    const interval = setInterval(checkNotifications, 60000);
    
    return () => clearInterval(interval);
  }, [notifications]);
  
  // Create a new reminder schedule
  const createSchedule = (scheduleData: Omit<ReminderSchedule, 'id' | 'isPaused' | 'lastUpdated'>) => {
    const newSchedule: ReminderSchedule = {
      ...scheduleData,
      id: generateId(),
      isPaused: false,
      lastUpdated: new Date().toISOString()
    };
    
    setSchedules(prev => [...prev, newSchedule]);
    
    // Generate initial notifications
    const newNotifications = generateUpcomingReminders(newSchedule);
    setNotifications(prev => [...prev, ...newNotifications]);
    
    return newSchedule;
  };
  
  // Update an existing schedule
  const updateSchedule = (id: string, updates: Partial<Omit<ReminderSchedule, 'id'>>) => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.id === id) {
        const updated = { 
          ...schedule, 
          ...updates, 
          lastUpdated: new Date().toISOString() 
        };
        
        // Remove existing future notifications for this schedule
        setNotifications(prev => 
          prev.filter(n => !(n.scheduleId === id && !n.triggered))
        );
        
        // Generate new notifications
        const newNotifications = generateUpcomingReminders(updated);
        setNotifications(prev => [...prev, ...newNotifications]);
        
        return updated;
      }
      return schedule;
    }));
  };
  
  // Toggle pause/resume state
  const togglePauseSchedule = (id: string) => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.id === id) {
        const isPaused = !schedule.isPaused;
        const updated = { 
          ...schedule, 
          isPaused,
          lastUpdated: new Date().toISOString() 
        };
        
        // Remove or regenerate notifications based on pause state
        if (isPaused) {
          setNotifications(prev => 
            prev.filter(n => !(n.scheduleId === id && !n.triggered))
          );
        } else {
          const newNotifications = generateUpcomingReminders(updated);
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        return updated;
      }
      return schedule;
    }));
  };
  
  // Delete a schedule
  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
    setNotifications(prev => prev.filter(notification => notification.scheduleId !== id));
  };
  
  // Get upcoming reminders for a schedule
  const getUpcomingReminders = (scheduleId: string): ReminderNotification[] => {
    return notifications
      .filter(n => n.scheduleId === scheduleId && !n.triggered)
      .sort((a, b) => 
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      );
  };
  
  return {
    schedules,
    notifications,
    createSchedule,
    updateSchedule,
    togglePauseSchedule,
    deleteSchedule,
    getUpcomingReminders
  };
};