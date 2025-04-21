import React, { useState } from 'react';
import Header from './components/Header';
import Layout from './components/Layout';
import ReminderForm from './components/ReminderForm';
import ReminderList from './components/ReminderList';
import EmptyState from './components/EmptyState';
import { useReminders } from './hooks/useReminders';
import { ReminderSchedule } from './types';

function App() {
  const {
    schedules,
    createSchedule,
    updateSchedule,
    togglePauseSchedule,
    deleteSchedule,
    getUpcomingReminders
  } = useReminders();
  
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReminderSchedule | undefined>(undefined);
  
  const handleNewReminder = () => {
    setEditingSchedule(undefined);
    setShowForm(true);
  };
  
  const handleEditReminder = (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (schedule) {
      setEditingSchedule(schedule);
      setShowForm(true);
    }
  };
  
  const handleSaveReminder = (scheduleData: Omit<ReminderSchedule, 'id' | 'isPaused' | 'lastUpdated'>) => {
    if (editingSchedule) {
      updateSchedule(editingSchedule.id, scheduleData);
    } else {
      createSchedule(scheduleData);
    }
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSchedule(undefined);
  };

  return (
    <>
      <Header onNewReminder={handleNewReminder} />
      <Layout>
        {schedules.length === 0 ? (
          <EmptyState onNewReminder={handleNewReminder} />
        ) : (
          <ReminderList
            schedules={schedules}
            getUpcomingReminders={getUpcomingReminders}
            onEdit={handleEditReminder}
            onTogglePause={togglePauseSchedule}
            onDelete={deleteSchedule}
          />
        )}
        
        {showForm && (
          <ReminderForm
            onClose={handleCloseForm}
            onSave={handleSaveReminder}
            scheduleToEdit={editingSchedule}
          />
        )}
      </Layout>
    </>
  );
}

export default App;