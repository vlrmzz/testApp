const { setupDatabase } = require('./database');

const runSetup = async () => {
  try {
    console.log('Setting up database for Heroku...');
    await setupDatabase();
    console.log('Database setup complete');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
};

runSetup();