import { runAllSeeds } from './seed';

const initializeDatabase = async () => {
  console.log('🚀 Initializing database with seed data...');

  try {
    await runAllSeeds();
    console.log('✅ Database initialization completed!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't exit process - let the server start anyway
  }
};

export { initializeDatabase };
