import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// lista płatności
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
  res.json(result.rows);
});

// dodanie płatności
router.post('/', async (req, res) => {
  const { booking_id, amount, method, status } = req.body;
  const result = await pool.query(
    `INSERT INTO payments (booking_id, amount, method, status) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [booking_id, amount, method, status || 'pending']
  );
  res.json(result.rows[0]);
});

export default router;
