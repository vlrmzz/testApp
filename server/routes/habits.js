const express = require('express');
const { pool } = require('../database');
const { habitValidation, habitEntryValidation, handleValidationErrors } = require('../utils/validation');

const router = express.Router();

// Get all habits for user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT h.*, COUNT(he.id) as total_entries,
       MAX(he.entry_date) as last_completed
       FROM habits h
       LEFT JOIN habit_entries he ON h.id = he.habit_id
       WHERE h.user_id = $1 AND h.is_active = true
       GROUP BY h.id
       ORDER BY h.created_at DESC`,
      [userId]
    );

    res.json({ habits: result.rows });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single habit with entries
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get habit
    const habitResult = await pool.query(
      'SELECT * FROM habits WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (habitResult.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Get recent entries (last 30 days)
    const entriesResult = await pool.query(
      `SELECT * FROM habit_entries
       WHERE habit_id = $1 AND entry_date >= CURRENT_DATE - INTERVAL '30 days'
       ORDER BY entry_date DESC`,
      [id]
    );

    res.json({
      habit: habitResult.rows[0],
      entries: entriesResult.rows
    });
  } catch (error) {
    console.error('Get habit error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create habit
router.post('/', habitValidation, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, frequency, target_count, color } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO habits (user_id, title, description, frequency, target_count, color)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title, description, frequency || 'daily', target_count || 1, color || '#3B82F6']
    );

    res.status(201).json({
      message: 'Habit created successfully',
      habit: result.rows[0]
    });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update habit
router.put('/:id', habitValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, frequency, target_count, color, is_active } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE habits
       SET title = $1, description = $2, frequency = $3, target_count = $4,
           color = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title, description, frequency, target_count, color, is_active, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json({
      message: 'Habit updated successfully',
      habit: result.rows[0]
    });
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete habit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'UPDATE habits SET is_active = false WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Log habit entry
router.post('/:id/entries', habitEntryValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { completed_count, notes, entry_date } = req.body;
    const userId = req.user.id;

    // Verify habit belongs to user
    const habitResult = await pool.query(
      'SELECT id FROM habits WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (habitResult.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const entryDateValue = entry_date || new Date().toISOString().split('T')[0];

    // Insert or update entry
    const result = await pool.query(
      `INSERT INTO habit_entries (habit_id, user_id, completed_count, notes, entry_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (habit_id, entry_date)
       DO UPDATE SET completed_count = $3, notes = $4, created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [id, userId, completed_count || 1, notes, entryDateValue]
    );

    res.status(201).json({
      message: 'Habit entry logged successfully',
      entry: result.rows[0]
    });
  } catch (error) {
    console.error('Log habit entry error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get habit entries for a specific period
router.get('/:id/entries', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;
    const userId = req.user.id;

    // Verify habit belongs to user
    const habitResult = await pool.query(
      'SELECT id FROM habits WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (habitResult.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    let query = `SELECT * FROM habit_entries WHERE habit_id = $1`;
    let params = [id];

    if (start_date) {
      params.push(start_date);
      query += ` AND entry_date >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      query += ` AND entry_date <= $${params.length}`;
    }

    query += ` ORDER BY entry_date DESC`;

    const result = await pool.query(query, params);

    res.json({ entries: result.rows });
  } catch (error) {
    console.error('Get habit entries error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get streak information
router.get('/:id/streak', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify habit belongs to user
    const habitResult = await pool.query(
      'SELECT id, frequency FROM habits WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (habitResult.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const habit = habitResult.rows[0];

    // Get all entries for streak calculation
    const entriesResult = await pool.query(
      'SELECT entry_date FROM habit_entries WHERE habit_id = $1 ORDER BY entry_date DESC',
      [id]
    );

    const entries = entriesResult.rows.map(row => row.entry_date);

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (entries.length > 0) {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      // Check if completed today or yesterday for current streak
      const lastEntry = new Date(entries[0]);
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const lastEntryStr = lastEntry.toISOString().split('T')[0];

      if (lastEntryStr === todayStr || lastEntryStr === yesterdayStr) {
        // Calculate current streak
        let checkDate = new Date(lastEntry);
        for (let i = 0; i < entries.length; i++) {
          const entryDate = new Date(entries[i]);
          if (entryDate.toISOString().split('T')[0] === checkDate.toISOString().split('T')[0]) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      tempStreak = 1;
      longestStreak = 1;

      for (let i = 1; i < entries.length; i++) {
        const currentDate = new Date(entries[i]);
        const prevDate = new Date(entries[i - 1]);
        const diffTime = prevDate.getTime() - currentDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    res.json({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_completions: entries.length
    });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;