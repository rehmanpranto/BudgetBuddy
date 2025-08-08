import 'dotenv/config';
import { query } from './src/lib/db.js';

async function setupDatabase() {
  console.log('Setting up database tables...');
  
  try {
    // Drop existing tables if they exist (be careful in production!)
    await query('DROP TABLE IF EXISTS transactions CASCADE');
    await query('DROP TABLE IF EXISTS users CASCADE');
    
    // Create users table
    await query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create transactions table
    await query(`
      CREATE TABLE transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
        amount NUMERIC NOT NULL,
        category TEXT NOT NULL,
        date DATE NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Database tables created successfully!');
    console.log('Tables created:');
    console.log('- users (id, email, password_hash, created_at)');
    console.log('- transactions (id, user_id, type, amount, category, date, note, created_at)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
