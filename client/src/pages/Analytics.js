import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitsContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import {
  ChartBarIcon,
  FireIcon,
  TrophyIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const { habits, getHabitEntries } = useHabits();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [habitEntries, setHabitEntries] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [habits, selectedPeriod]);

  const loadAnalyticsData = async () => {
    if (habits.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const entries = {};

    const endDate = new Date();
    const startDate = selectedPeriod === 'week'
      ? subDays(endDate, 7)
      : selectedPeriod === 'month'
      ? subDays(endDate, 30)
      : subDays(endDate, 90);

    for (const habit of habits) {
      try {
        const habitEntryData = await getHabitEntries(habit.id, {
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd')
        });
        entries[habit.id] = habitEntryData;
      } catch (error) {
        console.error(`Failed to load entries for habit ${habit.id}:`, error);
        entries[habit.id] = [];
      }
    }

    setHabitEntries(entries);
    setLoading(false);
  };

  const getCompletionRateData = () => {
    const data = habits.map(habit => {
      const entries = habitEntries[habit.id] || [];
      const totalDays = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
      const completionRate = (entries.length / totalDays) * 100;

      return {
        label: habit.title,
        rate: Math.round(completionRate),
        color: habit.color,
        entries: entries.length,
        total: totalDays
      };
    });

    return {
      labels: data.map(d => d.label),
      datasets: [
        {
          label: 'Completion Rate (%)',
          data: data.map(d => d.rate),
          backgroundColor: data.map(d => d.color),
          borderColor: data.map(d => d.color),
          borderWidth: 1,
        },
      ],
    };
  };

  const getStreakData = () => {
    const endDate = new Date();
    const startDate = subDays(endDate, selectedPeriod === 'week' ? 7 : 30);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    const datasets = habits.slice(0, 5).map(habit => {
      const entries = habitEntries[habit.id] || [];
      const entryDates = entries.map(entry => entry.entry_date);

      const data = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return entryDates.includes(dateStr) ? 1 : 0;
      });

      return {
        label: habit.title,
        data: data,
        borderColor: habit.color,
        backgroundColor: habit.color + '20',
        tension: 0.1,
      };
    });

    return {
      labels: dateRange.map(date => format(date, 'MMM d')),
      datasets,
    };
  };

  const getHabitDistribution = () => {
    const data = habits.map(habit => {
      const entries = habitEntries[habit.id] || [];
      return {
        label: habit.title,
        value: entries.length,
        color: habit.color
      };
    });

    return {
      labels: data.map(d => d.label),
      datasets: [
        {
          data: data.map(d => d.value),
          backgroundColor: data.map(d => d.color),
          borderWidth: 0,
        },
      ],
    };
  };

  const calculateStats = () => {
    const totalEntries = Object.values(habitEntries).flat().length;
    const totalPossible = habits.length * (selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90);
    const overallCompletion = totalPossible > 0 ? Math.round((totalEntries / totalPossible) * 100) : 0;

    const bestHabit = habits.reduce((best, habit) => {
      const entries = habitEntries[habit.id] || [];
      const bestEntries = habitEntries[best?.id] || [];
      return entries.length > bestEntries.length ? habit : best;
    }, habits[0]);

    return {
      totalEntries,
      overallCompletion,
      bestHabit: bestHabit?.title || 'N/A',
      activeHabits: habits.length
    };
  };

  const stats = calculateStats();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: function(value) {
            return value === 1 ? 'Completed' : 'Not Completed';
          }
        }
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your progress and identify patterns</p>
        </div>

        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="quarter">Last 90 days</option>
        </select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100">
              <ChartBarIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overall Completion</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overallCompletion}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FireIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Completions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalEntries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <TrophyIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Best Habit</p>
              <p className="text-lg font-semibold text-gray-900 truncate">{stats.bestHabit}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Habits</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeHabits}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data to analyze</h3>
          <p className="text-gray-600">
            Create some habits and start tracking to see your analytics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Completion Rate Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Rates</h3>
            <div className="h-64">
              <Bar data={getCompletionRateData()} options={chartOptions} />
            </div>
          </div>

          {/* Daily Progress Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Progress</h3>
            <div className="h-64">
              <Line data={getStreakData()} options={lineChartOptions} />
            </div>
          </div>

          {/* Habit Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Habit Distribution</h3>
            <div className="h-64">
              <Doughnut data={getHabitDistribution()} options={doughnutOptions} />
            </div>
          </div>

          {/* Habit Performance Table */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Habit Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Habit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {habits.map((habit) => {
                    const entries = habitEntries[habit.id] || [];
                    const totalDays = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
                    const rate = Math.round((entries.length / totalDays) * 100);

                    return (
                      <tr key={habit.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ backgroundColor: habit.color }}
                            />
                            <div className="text-sm font-medium text-gray-900">
                              {habit.title}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entries.length}/{totalDays}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rate >= 80 ? 'bg-green-100 text-green-800' :
                            rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;