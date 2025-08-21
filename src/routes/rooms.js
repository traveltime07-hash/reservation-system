import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// lista pokoi dla obiektu
router.get('/properties/:id/rooms', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM rooms WHERE property_id = $1',
    [req.params.id]
  );
  res.json(result.rows);
});

// dodanie pokoju
router.post('/properties/:id/rooms', async (req, res) => {
  const { name, capacity } = req.body;
  const result = await pool.query(
    `INSERT INTO rooms (property_id, name, capacity) 
     VALUES ($1, $2, $3) RETURNING *`,
    [req.params.id, name, capacity]
  );
  res.json(result.rows[0]);
});

export default router;
