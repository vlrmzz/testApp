const express = require('express');
const { pool } = require('../database');

const router = express.Router();

// Search users
router.get('/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const result = await pool.query(
      `SELECT id, username, first_name, last_name, avatar_url
       FROM users
       WHERE (username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)
       AND id != $2
       LIMIT 20`,
      [`%${q.trim()}%`, userId]
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send friend request
router.post('/friends/request', async (req, res) => {
  try {
    const { user_id } = req.body;
    const requesterId = req.user.id;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (user_id === requesterId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if user exists
    const userExists = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if friendship already exists
    const existingFriendship = await pool.query(
      `SELECT id, status FROM friendships
       WHERE (requester_id = $1 AND addressee_id = $2)
       OR (requester_id = $2 AND addressee_id = $1)`,
      [requesterId, user_id]
    );

    if (existingFriendship.rows.length > 0) {
      const friendship = existingFriendship.rows[0];
      if (friendship.status === 'accepted') {
        return res.status(400).json({ message: 'You are already friends with this user' });
      } else {
        return res.status(400).json({ message: 'Friend request already exists' });
      }
    }

    // Create friend request
    const result = await pool.query(
      `INSERT INTO friendships (requester_id, addressee_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING id`,
      [requesterId, user_id]
    );

    res.status(201).json({
      message: 'Friend request sent successfully',
      friendship_id: result.rows[0].id
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get friend requests (received)
router.get('/friends/requests', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT f.id, f.created_at, u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url
       FROM friendships f
       JOIN users u ON f.requester_id = u.id
       WHERE f.addressee_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({ requests: result.rows });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Respond to friend request
router.put('/friends/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const userId = req.user.id;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'Action must be either accept or decline' });
    }

    // Verify the request is for this user
    const requestResult = await pool.query(
      'SELECT id FROM friendships WHERE id = $1 AND addressee_id = $2 AND status = $3',
      [id, userId, 'pending']
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    await pool.query(
      'UPDATE friendships SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newStatus, id]
    );

    res.json({
      message: `Friend request ${action}ed successfully`
    });
  } catch (error) {
    console.error('Respond to friend request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get friends list
router.get('/friends', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
        CASE
          WHEN f.requester_id = $1 THEN u2.id
          ELSE u1.id
        END as friend_id,
        CASE
          WHEN f.requester_id = $1 THEN u2.username
          ELSE u1.username
        END as username,
        CASE
          WHEN f.requester_id = $1 THEN u2.first_name
          ELSE u1.first_name
        END as first_name,
        CASE
          WHEN f.requester_id = $1 THEN u2.last_name
          ELSE u1.last_name
        END as last_name,
        CASE
          WHEN f.requester_id = $1 THEN u2.avatar_url
          ELSE u1.avatar_url
        END as avatar_url,
        f.created_at as friends_since
       FROM friendships f
       JOIN users u1 ON f.requester_id = u1.id
       JOIN users u2 ON f.addressee_id = u2.id
       WHERE (f.requester_id = $1 OR f.addressee_id = $1) AND f.status = 'accepted'
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({ friends: result.rows });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove friend
router.delete('/friends/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `DELETE FROM friendships
       WHERE ((requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1))
       AND status = 'accepted'
       RETURNING id`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send cheer
router.post('/cheers', async (req, res) => {
  try {
    const { to_user_id, habit_id, message } = req.body;
    const fromUserId = req.user.id;

    if (!to_user_id || !habit_id) {
      return res.status(400).json({ message: 'User ID and habit ID are required' });
    }

    // Verify friendship
    const friendshipResult = await pool.query(
      `SELECT id FROM friendships
       WHERE ((requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1))
       AND status = 'accepted'`,
      [fromUserId, to_user_id]
    );

    if (friendshipResult.rows.length === 0) {
      return res.status(403).json({ message: 'You can only cheer friends' });
    }

    // Verify habit belongs to the target user
    const habitResult = await pool.query(
      'SELECT id FROM habits WHERE id = $1 AND user_id = $2',
      [habit_id, to_user_id]
    );

    if (habitResult.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Send cheer
    const result = await pool.query(
      `INSERT INTO cheers (from_user_id, to_user_id, habit_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [fromUserId, to_user_id, habit_id, message]
    );

    res.status(201).json({
      message: 'Cheer sent successfully',
      cheer_id: result.rows[0].id
    });
  } catch (error) {
    console.error('Send cheer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get received cheers
router.get('/cheers', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT c.*, u.username, u.first_name, u.last_name, u.avatar_url, h.title as habit_title
       FROM cheers c
       JOIN users u ON c.from_user_id = u.id
       JOIN habits h ON c.habit_id = h.id
       WHERE c.to_user_id = $1
       ORDER BY c.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({ cheers: result.rows });
  } catch (error) {
    console.error('Get cheers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get friends' recent activities
router.get('/feed', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
        he.entry_date,
        he.completed_count,
        he.notes,
        h.title as habit_title,
        h.color as habit_color,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar_url
       FROM habit_entries he
       JOIN habits h ON he.habit_id = h.id
       JOIN users u ON he.user_id = u.id
       JOIN friendships f ON ((f.requester_id = $1 AND f.addressee_id = u.id)
                           OR (f.requester_id = u.id AND f.addressee_id = $1))
       WHERE f.status = 'accepted'
       AND he.entry_date >= CURRENT_DATE - INTERVAL '7 days'
       ORDER BY he.entry_date DESC, he.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({ activities: result.rows });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;