import { Router } from 'express';
import { pool } from '../db.js';
const router = Router();

router.get('/rooms', async (req, res) => {
  const propertyId = req.query.property_id;
  let rows;
  if (propertyId) {
    ({ rows } = await pool.query(
      'SELECT id, property_id, name, capacity, price_per_night FROM rooms WHERE property_id=$1 ORDER BY id',
      [propertyId]
    ));
  } else {
    ({ rows } = await pool.query(
      'SELECT id, property_id, name, capacity, price_per_night FROM rooms ORDER BY id'
    ));
  }
  res.json(rows);
});

router.post('/rooms', async (req, res) => {
  const { property_id, name, capacity, price_per_night } = req.body;
  if (!property_id || !name) return res.status(400).json({ error: 'Brak wymaganych pól' });
  const { rows } = await pool.query(
    `INSERT INTO rooms (property_id, name, capacity, price_per_night)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [property_id, name, capacity || 1, price_per_night || 0]
  );
  res.status(201).json(rows[0]);
});

export default router;
