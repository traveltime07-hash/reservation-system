import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// pobierz wszystkie rezerwacje
router.get("/bookings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bookings ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// dodaj rezerwację
router.post("/bookings", async (req, res) => {
  const { room_id, guest_name, guest_email, from_date, to_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bookings (room_id, guest_name, guest_email, from_date, to_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [room_id, guest_name, guest_email, from_date, to_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
