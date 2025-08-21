import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// pobierz wszystkie pokoje
router.get("/rooms", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM rooms ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// dodaj pokój
router.post("/rooms", async (req, res) => {
  const { property_id, name, capacity, price } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO rooms (property_id, name, capacity, price) VALUES ($1, $2, $3, $4) RETURNING *",
      [property_id, name, capacity, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
