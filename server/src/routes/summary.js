import express from 'express';
import { authMiddleware } from '../lib/auth.js';
import { query } from '../lib/db.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const incomeRes = await query('SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE user_id=$1 AND type=$2', [req.user.id, 'income']);
    const expenseRes = await query('SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE user_id=$1 AND type=$2', [req.user.id, 'expense']);
    const income = Number(incomeRes.rows[0].total || 0);
    const expenses = Number(expenseRes.rows[0].total || 0);
    res.json({ income, expenses, balance: income - expenses });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
