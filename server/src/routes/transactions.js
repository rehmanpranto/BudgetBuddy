import express from 'express';
import { z } from 'zod';
import { authMiddleware } from '../lib/auth.js';
import { query } from '../lib/db.js';

const router = express.Router();

const txSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  category: z.string().min(1),
  date: z.string(),
  note: z.string().optional(),
});

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { category, startDate, endDate } = req.query;
  const conditions = ['user_id = $1'];
  const params = [req.user.id];
  let idx = 2;
  if (category) { conditions.push(`category = $${idx++}`); params.push(category); }
  if (startDate) { conditions.push(`date >= $${idx++}`); params.push(startDate); }
  if (endDate) { conditions.push(`date <= $${idx++}`); params.push(endDate); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const { rows } = await query(`SELECT id, type, amount, category, date, note FROM transactions ${where} ORDER BY date DESC`, params);
    const normalized = rows.map(r => ({ ...r, amount: Number(r.amount) }));
    res.json(normalized);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const parsed = txSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { type, amount, category, date, note } = parsed.data;
  try {
    const { rows } = await query(
      'INSERT INTO transactions (user_id, type, amount, category, date, note) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, type, amount, category, date, note',
      [req.user.id, type, amount, category, date, note || null]
    );
    const r = rows[0];
    res.status(201).json({ ...r, amount: Number(r.amount) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const parsed = txSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { type, amount, category, date, note } = parsed.data;
  try {
    const { rows } = await query(
      'UPDATE transactions SET type=$1, amount=$2, category=$3, date=$4, note=$5 WHERE id=$6 AND user_id=$7 RETURNING id, type, amount, category, date, note',
      [type, amount, category, date, note || null, id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    const r = rows[0];
    res.json({ ...r, amount: Number(r.amount) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const { rowCount } = await query('DELETE FROM transactions WHERE id=$1 AND user_id=$2', [id, req.user.id]);
    if (!rowCount) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
