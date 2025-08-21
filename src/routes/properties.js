import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// list all
router.get('/properties', async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, city, address, description FROM properties ORDER BY id');
  res.json(rows);
});

// create (owner)
router.post('/properties', requireAuth, requireRole('owner'), async (req, res) => {
  const { name, city, address, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Brak nazwy' });
  const { rows } = await pool.query(
    `INSERT INTO properties (name, city, address, description, owner_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name, city, address, description, req.user.id]
  );
  res.status(201).json(rows[0]);
});

export default router;
