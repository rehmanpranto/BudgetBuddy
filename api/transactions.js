import jwt from 'jsonwebtoken';
import { Client } from 'pg';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

    if (req.method === 'GET') {
      // Get transactions
      const { category, startDate, endDate } = req.query;
      const conditions = ['user_id = $1'];
      const params = [userId];
      let idx = 2;

      if (category) { 
        conditions.push(`category = $${idx++}`); 
        params.push(category); 
      }
      if (startDate) { 
        conditions.push(`date >= $${idx++}`); 
        params.push(startDate); 
      }
      if (endDate) { 
        conditions.push(`date <= $${idx++}`); 
        params.push(endDate); 
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      
      const result = await client.query(
        `SELECT id, type, amount, category, date, note FROM transactions ${where} ORDER BY date DESC`, 
        params
      );

      const transactions = result.rows.map(r => ({ ...r, amount: Number(r.amount) }));
      res.status(200).json(transactions);

    } else if (req.method === 'POST') {
      // Create transaction
      const { type, amount, category, date, note } = req.body;

      if (!type || !amount || !category || !date) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const result = await client.query(
        'INSERT INTO transactions (user_id, type, amount, category, date, note) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, type, amount, category, date, note',
        [userId, type, amount, category, date, note]
      );

      const transaction = { ...result.rows[0], amount: Number(result.rows[0].amount) };
      res.status(201).json(transaction);

    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    await client.end();
  }
}
