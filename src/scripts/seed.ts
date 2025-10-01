import client from '../database';
import bcrypt from 'bcrypt';
import { seedProducts } from './seedProducts';

const pepper = process.env.BCRYPT_PEPPER || "";
const saltRounds = parseInt(process.env.SALT_ROUNDS as string) || 10;

const seedUsers = async () => {
  try {
    const conn = await client.connect();

    // Check if demo user already exists
    const existingUser = await conn.query(
      'SELECT id FROM users WHERE email = $1',
      ['demo@example.com']
    );

    if (existingUser.rows.length > 0) {
      console.log('Demo user already exists, skipping user seed...');
      conn.release();
      return;
    }

    // Hash password for demo user
    const demoPassword = process.env.DEMO_USER_PASSWORD || 'demo123';
    const hashedPassword = await bcrypt.hash(demoPassword + pepper, saltRounds);

    // Insert demo users
    const users = [
      {
        first_name: 'Demo',
        last_name: 'User',
        email: 'demo@example.com',
        password: hashedPassword
      },
      {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('password123' + pepper, saltRounds)
      },
      {
        first_name: 'Admin',
        last_name: 'Test',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123' + pepper, saltRounds)
      }
    ];

    for (const user of users) {
      await conn.query(
        'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)',
        [user.first_name, user.last_name, user.email, user.password]
      );
      console.log(`✅ Created user: ${user.email}`);
    }

    conn.release();
    console.log('🎉 User seed completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

const runAllSeeds = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    await seedUsers();
    await seedProducts();

    console.log('🎉 All seeds completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  runAllSeeds();
}

export { seedUsers, runAllSeeds };
