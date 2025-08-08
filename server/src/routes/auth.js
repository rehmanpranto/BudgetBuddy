import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { z } from 'zod';
import { query } from '../lib/db.js';
import { signToken } from '../lib/auth.js';
import { sendPasswordResetEmail } from '../lib/emailService.js';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { email, password } = parsed.data;
  try {
    const existing = await query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rowCount) return res.status(409).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hash]
    );
    const token = signToken(rows[0]);
    res.status(201).json({ token, user: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { email, password } = parsed.data;
  try {
    const { rows } = await query('SELECT id, email, password_hash FROM users WHERE email=$1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  
  const { email } = parsed.data;
  
  try {
    // Check if user exists
    const { rows } = await query('SELECT id, email FROM users WHERE email=$1', [email]);
    
    // Always return success to prevent email enumeration
    if (!rows[0]) {
      return res.json({ message: 'If that email exists, we sent a password reset link.' });
    }
    
    const user = rows[0];
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    // Store reset token in database
    await query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, hashedToken, expiresAt]
    );
    
    // Send email
    const emailResult = await sendPasswordResetEmail(email, resetToken);
    
    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }
    
    res.json({ message: 'If that email exists, we sent a password reset link.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  
  const { token, password } = parsed.data;
  
  try {
    // Hash the token to match database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find valid reset token
    const { rows } = await query(
      `SELECT prt.id, prt.user_id, prt.expires_at, u.email 
       FROM password_reset_tokens prt 
       JOIN users u ON prt.user_id = u.id 
       WHERE prt.token = $1 AND prt.used = FALSE AND prt.expires_at > NOW()`,
      [hashedToken]
    );
    
    if (!rows[0]) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    const resetRecord = rows[0];
    
    // Hash new password
    const hash = await bcrypt.hash(password, 10);
    
    // Update user password
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, resetRecord.user_id]);
    
    // Mark token as used
    await query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [resetRecord.id]);
    
    res.json({ message: 'Password reset successful' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
