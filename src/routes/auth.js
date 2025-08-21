import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { registerSchema, loginSchema } from '../utils/validate.js';

const router = Router();

// register
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [data.email]);
    if (exists.rowCount) return res.status(400).json({ error: 'Email zajęty' });

    const hash = await bcrypt.hash(data.password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1,$2,$3,$4) RETURNING id, email, name, role`,
      [data.email, hash, data.name, data.role]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const { rows } = await pool.query('SELECT id, email, password_hash, name, role FROM users WHERE email=$1', [data.email]);
    if (!rows.length) return res.status(400).json({ error: 'Nieprawidłowe dane' });
    const user = rows[0];
    const ok = await bcrypt.compare(data.password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Nieprawidłowe dane' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// forgot password (stub)
router.post('/forgot', async (req, res) => {
  res.json({ status: 'ok', message: 'Stub odzyskiwania hasła — podłącz dostawcę e-mail/SMS.' });
});

export default router;
