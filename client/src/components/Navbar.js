import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  ChartBarIcon,
  UserGroupIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary-600">
              HabitTracker
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className={`px-4 py-2 rounded-md ${
                  isActive('/login')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`px-4 py-2 rounded-md ${
                  isActive('/register')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary-600">
            HabitTracker
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/dashboard')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/habits"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/habits')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Habits</span>
            </Link>

            <Link
              to="/analytics"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/analytics')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Analytics</span>
            </Link>

            <Link
              to="/social"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/social')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <UserGroupIcon className="w-5 h-5" />
              <span>Social</span>
            </Link>

            <div className="relative group">
              <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-primary-600 transition-colors">
                <UserIcon className="w-5 h-5" />
                <span>{user?.username || 'User'}</span>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;