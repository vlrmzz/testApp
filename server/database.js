const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(-1);
});

// Database setup function
const setupDatabase = async () => {
  const client = await pool.connect();
  try {
    // Users table
    await client.query(`
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
      )
    `);

    // Habits table
    await client.query(`
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
      )
    `);

    // Habit entries (progress tracking)
    await client.query(`
      CREATE TABLE IF NOT EXISTS habit_entries (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        completed_count INTEGER DEFAULT 1,
        entry_date DATE DEFAULT CURRENT_DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(habit_id, entry_date)
      )
    `);

    // Friendships table
    await client.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        addressee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(requester_id, addressee_id)
      )
    `);

    // Cheers table (social encouragement)
    await client.query(`
      CREATE TABLE IF NOT EXISTS cheers (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_habit_entries_date ON habit_entries(entry_date)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_habit_entries_habit ON habit_entries(habit_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(requester_id, addressee_id)');

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  setupDatabase
};