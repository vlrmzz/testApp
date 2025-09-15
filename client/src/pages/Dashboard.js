import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHabits } from '../context/HabitsContext';
import { socialAPI } from '../services/api';
import { format, isToday } from 'date-fns';
import {
  PlusIcon,
  FireIcon,
  CheckIcon,
  ChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { habits, loading, logEntry } = useHabits();
  const [feed, setFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await socialAPI.getFeed();
      setFeed(response.data.activities);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoadingFeed(false);
    }
  };

  const handleLogEntry = async (habitId) => {
    await logEntry(habitId, {
      entry_date: new Date().toISOString().split('T')[0]
    });
  };

  const todaysHabits = habits.filter(habit => {
    const today = new Date().toISOString().split('T')[0];
    return !habit.last_completed || habit.last_completed !== today;
  });

  const completedToday = habits.filter(habit => {
    return habit.last_completed === new Date().toISOString().split('T')[0];
  });

  const totalStreak = habits.reduce((sum, habit) => sum + (parseInt(habit.total_entries) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
        <p className="text-primary-100">
          You have {todaysHabits.length} habits to complete today.
          Keep building those streaks! 🚀
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-semibold text-gray-900">{completedToday.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <FireIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-semibold text-gray-900">{totalStreak}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100">
              <ChartBarIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Habits</p>
              <p className="text-2xl font-semibold text-gray-900">{habits.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <UserGroupIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Social Feed</p>
              <p className="text-2xl font-semibold text-gray-900">{feed.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Habits */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Today's Habits</h2>
                <Link
                  to="/habits"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Habit
                </Link>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : todaysHabits.length === 0 ? (
                <div className="text-center py-8">
                  <CheckIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">All habits completed for today! 🎉</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Great job staying consistent with your habits.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: habit.color }}
                        ></div>
                        <div>
                          <h3 className="font-medium text-gray-900">{habit.title}</h3>
                          {habit.description && (
                            <p className="text-sm text-gray-600">{habit.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleLogEntry(habit.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <CheckIcon className="w-4 h-4 mr-1" />
                        Complete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Feed */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Friend Activity</h2>
                <Link
                  to="/social"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  View all
                </Link>
              </div>
            </div>

            <div className="p-6">
              {loadingFeed ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : feed.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No friend activity yet</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Add friends to see their progress
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feed.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {activity.avatar_url ? (
                          <img
                            src={activity.avatar_url}
                            alt={activity.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {activity.username?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.username}</span>
                          {' completed '}
                          <span className="font-medium" style={{ color: activity.habit_color }}>
                            {activity.habit_title}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(activity.entry_date), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;