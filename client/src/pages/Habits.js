import React, { useState } from 'react';
import { useHabits } from '../context/HabitsContext';
import { format, isToday } from 'date-fns';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  FireIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const HabitModal = ({ isOpen, onClose, habit, onSave }) => {
  const [formData, setFormData] = useState({
    title: habit?.title || '',
    description: habit?.description || '',
    frequency: habit?.frequency || 'daily',
    target_count: habit?.target_count || 1,
    color: habit?.color || '#3B82F6',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {habit ? 'Edit Habit' : 'Create New Habit'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Drink 8 glasses of water"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              rows="3"
              placeholder="Optional description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Count
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.target_count}
                onChange={(e) => setFormData(prev => ({ ...prev, target_count: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex space-x-2">
              {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
            >
              {habit ? 'Update' : 'Create'} Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HabitCard = ({ habit, onEdit, onDelete, onComplete }) => {
  const [showStats, setShowStats] = useState(false);

  const isCompletedToday = habit.last_completed === new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div
              className="w-4 h-4 rounded-full mt-1"
              style={{ backgroundColor: habit.color }}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{habit.title}</h3>
              {habit.description && (
                <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-500 capitalize">
                  {habit.frequency}
                </span>
                <span className="text-xs text-gray-500">
                  Target: {habit.target_count}
                </span>
                <span className="text-xs text-gray-500">
                  {habit.total_entries} completions
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isCompletedToday ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckIcon className="w-3 h-3 mr-1" />
                Done today
              </span>
            ) : (
              <button
                onClick={() => onComplete(habit.id)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <CheckIcon className="w-4 h-4 mr-1" />
                Complete
              </button>
            )}

            <button
              onClick={() => setShowStats(!showStats)}
              className="p-1.5 text-gray-400 hover:text-gray-600"
            >
              <ChartBarIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => onEdit(habit)}
              className="p-1.5 text-gray-400 hover:text-gray-600"
            >
              <PencilIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDelete(habit.id)}
              className="p-1.5 text-gray-400 hover:text-red-600"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showStats && (
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-gray-900">{habit.total_entries || 0}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-primary-600">0</p>
              <p className="text-xs text-gray-500">Current Streak</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-orange-600">0</p>
              <p className="text-xs text-gray-500">Best Streak</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Habits = () => {
  const { habits, loading, createHabit, updateHabit, deleteHabit, logEntry } = useHabits();
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const handleSave = async (habitData) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, habitData);
    } else {
      await createHabit(habitData);
    }
    setShowModal(false);
    setEditingHabit(null);
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(id);
    }
  };

  const handleComplete = async (habitId) => {
    await logEntry(habitId, {
      entry_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHabit(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Habits</h1>
          <p className="text-gray-600">Track your daily and weekly habits</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Habit
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12">
          <FireIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
          <p className="text-gray-600 mb-6">
            Start building better habits by creating your first one.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}

      <HabitModal
        isOpen={showModal}
        onClose={handleCloseModal}
        habit={editingHabit}
        onSave={handleSave}
      />
    </div>
  );
};

export default Habits;