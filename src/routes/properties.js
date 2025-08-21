import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// pobierz wszystkie obiekty
router.get("/properties", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM properties ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// dodaj obiekt
router.post("/properties", async (req, res) => {
  const { name, address } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO properties (name, address) VALUES ($1, $2) RETURNING *",
      [name, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
