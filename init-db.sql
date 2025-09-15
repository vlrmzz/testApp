-- Initialize the database with the required tables and indexes
-- This script will be run when the database container starts for the first time

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  username VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  google_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) DEFAULT 'daily',
  target_count INTEGER DEFAULT 1,
  color VARCHAR(20) DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habit entries (progress tracking)
CREATE TABLE IF NOT EXISTS habit_entries (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  completed_count INTEGER DEFAULT 1,
  entry_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(habit_id, entry_date)
);

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  addressee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, addressee_id)
);

-- Cheers table (social encouragement)
CREATE TABLE IF NOT EXISTS cheers (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habit_entries_date ON habit_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_habit_entries_habit ON habit_entries(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_entries_user ON habit_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(requester_id, addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_cheers_to_user ON cheers(to_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Insert some sample data for development (optional)
-- Uncomment the following lines if you want sample data

-- INSERT INTO users (email, username, first_name, last_name, password) VALUES
-- ('demo@example.com', 'demo', 'Demo', 'User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/bKT.Sch8dVjTyKm3q'),
-- ('test@example.com', 'test', 'Test', 'User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/bKT.Sch8dVjTyKm3q');

-- Sample habits for the demo user
-- INSERT INTO habits (user_id, title, description, frequency, target_count, color) VALUES
-- (1, 'Drink Water', 'Drink 8 glasses of water daily', 'daily', 8, '#3B82F6'),
-- (1, 'Exercise', 'Do 30 minutes of exercise', 'daily', 1, '#10B981'),
-- (1, 'Read Books', 'Read for at least 20 minutes', 'daily', 1, '#F59E0B'),
-- (1, 'Meditate', 'Practice mindfulness meditation', 'daily', 1, '#8B5CF6');

COMMIT;