import React, { useState, useEffect } from 'react';
import { socialAPI } from '../services/api';
import { format } from 'date-fns';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  CheckIcon,
  XMarkIcon,
  HeartIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const UserSearchModal = ({ isOpen, onClose, onAddFriend }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await socialAPI.searchUsers(query);
      setSearchResults(response.data.users);
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await socialAPI.sendFriendRequest(userId);
      toast.success('Friend request sent!');
      setSearchResults(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      toast.error('Failed to send friend request');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Find Friends</h3>

        <div className="relative mb-4">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username or name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {searchQuery.length < 2 ? 'Start typing to search for users' : 'No users found'}
            </p>
          ) : (
            searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {user.username[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    {(user.first_name || user.last_name) && (
                      <p className="text-sm text-gray-600">
                        {user.first_name} {user.last_name}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAddFriend(user.id)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-full"
                >
                  <UserPlusIcon className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const FriendRequestCard = ({ request, onRespond }) => {
  const [loading, setLoading] = useState(false);

  const handleRespond = async (action) => {
    setLoading(true);
    try {
      await socialAPI.respondToFriendRequest(request.id, action);
      toast.success(`Friend request ${action}ed`);
      onRespond(request.id);
    } catch (error) {
      toast.error('Failed to respond to friend request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
      <div className="flex items-center space-x-3">
        {request.avatar_url ? (
          <img
            src={request.avatar_url}
            alt={request.username}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {request.username[0]?.toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900">{request.username}</p>
          {(request.first_name || request.last_name) && (
            <p className="text-sm text-gray-600">
              {request.first_name} {request.last_name}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {format(new Date(request.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handleRespond('accept')}
          disabled={loading}
          className="p-2 text-green-600 hover:bg-green-50 rounded-full disabled:opacity-50"
        >
          <CheckIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleRespond('decline')}
          disabled={loading}
          className="p-2 text-red-600 hover:bg-red-50 rounded-full disabled:opacity-50"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const FriendCard = ({ friend, onRemove }) => {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    setLoading(true);
    try {
      await socialAPI.removeFriend(friend.friend_id);
      toast.success('Friend removed');
      onRemove(friend.friend_id);
    } catch (error) {
      toast.error('Failed to remove friend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
      <div className="flex items-center space-x-3">
        {friend.avatar_url ? (
          <img
            src={friend.avatar_url}
            alt={friend.username}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {friend.username[0]?.toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900">{friend.username}</p>
          {(friend.first_name || friend.last_name) && (
            <p className="text-sm text-gray-600">
              {friend.first_name} {friend.last_name}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Friends since {format(new Date(friend.friends_since), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      <button
        onClick={handleRemove}
        disabled={loading}
        className="text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
};

const ActivityFeed = ({ activities }) => {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start space-x-3 p-4 bg-white border rounded-lg">
          {activity.avatar_url ? (
            <img
              src={activity.avatar_url}
              alt={activity.username}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {activity.username[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-900">
              <span className="font-medium">{activity.username}</span>
              {' completed '}
              <span
                className="font-medium"
                style={{ color: activity.habit_color }}
              >
                {activity.habit_title}
              </span>
              {activity.completed_count > 1 && (
                <span className="text-gray-600"> ({activity.completed_count}x)</span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(activity.entry_date), 'MMM d, yyyy')}
            </p>
            {activity.notes && (
              <p className="text-sm text-gray-600 mt-2 italic">"{activity.notes}"</p>
            )}
          </div>
          <button className="p-1 text-gray-400 hover:text-red-500">
            <HeartIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

const Social = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    try {
      const [requestsResponse, friendsResponse, feedResponse] = await Promise.all([
        socialAPI.getFriendRequests(),
        socialAPI.getFriends(),
        socialAPI.getFeed(),
      ]);

      setFriendRequests(requestsResponse.data.requests);
      setFriends(friendsResponse.data.friends);
      setFeed(feedResponse.data.activities);
    } catch (error) {
      toast.error('Failed to load social data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResponse = (requestId) => {
    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    loadSocialData(); // Reload to update friends list
  };

  const handleFriendRemove = (friendId) => {
    setFriends(prev => prev.filter(friend => friend.friend_id !== friendId));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social</h1>
          <p className="text-gray-600">Connect with friends and share your progress</p>
        </div>

        <button
          onClick={() => setShowSearchModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <UserPlusIcon className="w-4 h-4 mr-2" />
          Add Friends
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'feed', label: 'Activity Feed', count: feed.length },
            { id: 'friends', label: 'Friends', count: friends.length },
            { id: 'requests', label: 'Friend Requests', count: friendRequests.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'feed' && (
          <div>
            {feed.length === 0 ? (
              <div className="text-center py-12">
                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-600 mb-6">
                  Add friends to see their habit progress and achievements.
                </p>
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Find Friends
                </button>
              </div>
            ) : (
              <ActivityFeed activities={feed} />
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div>
            {friends.length === 0 ? (
              <div className="text-center py-12">
                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
                <p className="text-gray-600 mb-6">
                  Start connecting with others to share your habit journey.
                </p>
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Find Friends
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friend) => (
                  <FriendCard
                    key={friend.friend_id}
                    friend={friend}
                    onRemove={handleFriendRemove}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            {friendRequests.length === 0 ? (
              <div className="text-center py-12">
                <UserPlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No friend requests</h3>
                <p className="text-gray-600">
                  You don't have any pending friend requests.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {friendRequests.map((request) => (
                  <FriendRequestCard
                    key={request.id}
                    request={request}
                    onRespond={handleRequestResponse}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <UserSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </div>
  );
};

export default Social;