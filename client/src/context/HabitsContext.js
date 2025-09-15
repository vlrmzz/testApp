import React, { createContext, useContext, useState, useEffect } from 'react';
import { habitsAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const HabitsContext = createContext();

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
};

export const HabitsProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadHabits();
    }
  }, [isAuthenticated]);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const response = await habitsAPI.getHabits();
      setHabits(response.data.habits);
    } catch (error) {
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async (habitData) => {
    try {
      const response = await habitsAPI.createHabit(habitData);
      setHabits(prev => [response.data.habit, ...prev]);
      toast.success('Habit created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create habit';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateHabit = async (id, habitData) => {
    try {
      const response = await habitsAPI.updateHabit(id, habitData);
      setHabits(prev => prev.map(h => h.id === id ? response.data.habit : h));
      toast.success('Habit updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update habit';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const deleteHabit = async (id) => {
    try {
      await habitsAPI.deleteHabit(id);
      setHabits(prev => prev.filter(h => h.id !== id));
      toast.success('Habit deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete habit';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logEntry = async (habitId, entryData) => {
    try {
      await habitsAPI.logEntry(habitId, entryData);
      // Refresh habits to update streak/completion counts
      loadHabits();
      toast.success('Progress logged!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to log progress';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const getHabitStreak = async (id) => {
    try {
      const response = await habitsAPI.getStreak(id);
      return response.data;
    } catch (error) {
      console.error('Failed to get habit streak:', error);
      return null;
    }
  };

  const getHabitEntries = async (id, params = {}) => {
    try {
      const response = await habitsAPI.getEntries(id, params);
      return response.data.entries;
    } catch (error) {
      console.error('Failed to get habit entries:', error);
      return [];
    }
  };

  const value = {
    habits,
    loading,
    loadHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    logEntry,
    getHabitStreak,
    getHabitEntries,
  };

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
};