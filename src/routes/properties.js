import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// lista obiektów
router.get('/properties', async (req, res) => {
  const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC');
  res.json(result.rows);
});

// dodawanie obiektu
router.post('/properties', async (req, res) => {
  const { user_id, name, city } = req.body;
  const result = await pool.query(
    `INSERT INTO properties (user_id, name, city) 
     VALUES ($1, $2, $3) RETURNING *`,
    [user_id, name, city]
  );
  res.json(result.rows[0]);
});

export default router;
