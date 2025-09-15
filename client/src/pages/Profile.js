import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';

const ProfileForm = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    avatar_url: user?.avatar_url || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await onUpdate(formData);

    if (!result.success) {
      // Error handling is done in the context
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture
        </label>
        <div className="flex items-center space-x-4">
          {formData.avatar_url ? (
            <img
              src={formData.avatar_url}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div>
            <input
              type="url"
              placeholder="Enter image URL"
              value={formData.avatar_url}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a URL to your profile picture
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            id="first_name"
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            id="last_name"
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </form>
  );
};

const PasswordForm = ({ onChangePassword }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const result = await onChangePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });

    if (result.success) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Current Password
        </label>
        <input
          id="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Enter your current password"
        />
        {errors.currentPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.currentPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Enter your new password"
        />
        {errors.newPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Confirm your new password"
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
};

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-4">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserIcon className="w-5 h-5 inline mr-2" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <KeyIcon className="w-5 h-5 inline mr-2" />
            Security
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {activeTab === 'profile' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Profile Information
            </h3>
            <ProfileForm user={user} onUpdate={updateProfile} />
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Change Password
            </h3>
            <PasswordForm onChangePassword={changePassword} />
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block font-medium text-gray-700">Email</label>
            <p className="text-gray-600 flex items-center">
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              {user?.email}
            </p>
          </div>
          <div>
            <label className="block font-medium text-gray-700">Username</label>
            <p className="text-gray-600 flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              {user?.username}
            </p>
          </div>
          <div>
            <label className="block font-medium text-gray-700">Member Since</label>
            <p className="text-gray-600">
              {user?.created_at && new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;