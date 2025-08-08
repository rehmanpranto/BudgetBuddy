import jwt from 'jsonwebtoken';
import { Client } from 'pg';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.substring(7);
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    userId = decoded.id;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Calculate summary
    const result = await client.query(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
       FROM transactions 
       WHERE user_id = $1`,
      [userId]
    );

    const row = result.rows[0];
    const income = Number(row.income) || 0;
    const expenses = Number(row.expenses) || 0;
    const balance = income - expenses;

    res.status(200).json({ income, expenses, balance });

  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    await client.end();
  }
}
