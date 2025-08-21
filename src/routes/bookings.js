import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// lista rezerwacji
router.get('/bookings', async (req, res) => {
  const result = await pool.query('SELECT * FROM bookings ORDER BY from_date DESC');
  res.json(result.rows);
});

// dodanie rezerwacji
router.post('/bookings', async (req, res) => {
  const { room_id, customer_name, customer_email, from_date, to_date, status } = req.body;
  const result = await pool.query(
    `INSERT INTO bookings (room_id, customer_name, customer_email, from_date, to_date, status) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [room_id, customer_name, customer_email, from_date, to_date, status || 'confirmed']
  );
  res.json(result.rows[0]);
});

export default router;
