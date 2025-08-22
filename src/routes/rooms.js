import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// 📋 Lista pokoi dla obiektu
router.get('/properties/:id/rooms', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM rooms WHERE property_id = $1 ORDER BY id ASC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Błąd przy pobieraniu pokoi:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ➕ Dodanie pokoju
router.post('/properties/:id/rooms', async (req, res) => {
  try {
    const { name, capacity, description } = req.body;

    if (!name || !capacity) {
      return res.status(400).json({ error: "Musisz podać nazwę i pojemność pokoju" });
    }

    const result = await pool.query(
      `INSERT INTO rooms (property_id, name, capacity, description, status, created_at)
       VALUES ($1, $2, $3, $4, 'available', NOW())
       RETURNING *`,
      [req.params.id, name, capacity, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Błąd przy dodawaniu pokoju:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
