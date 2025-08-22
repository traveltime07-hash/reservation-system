import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ➕ Dodaj nową rezerwację
router.post("/", async (req, res) => {
  const { property_id, room_id, guest_name, guest_email, start_date, end_date, status } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO bookings (property_id, room_id, guest_name, guest_email, start_date, end_date, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [property_id, room_id, guest_name, guest_email, start_date, end_date, status]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Błąd przy dodawaniu rezerwacji:", err);
    res.status(500).json({ error: "Błąd serwera przy dodawaniu rezerwacji" });
  }
});

// 📖 Pobierz wszystkie rezerwacje
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bookings ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Błąd przy pobieraniu rezerwacji:", err);
    res.status(500).json({ error: "Błąd serwera przy pobieraniu rezerwacji" });
  }
});

// 📖 Pobierz pojedynczą rezerwację
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bookings WHERE id=$1", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Rezerwacja nie znaleziona" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Błąd przy pobieraniu rezerwacji:", err);
    res.status(500).json({ error: "Błąd serwera przy pobieraniu rezerwacji" });
  }
});

// ✏️ Aktualizacja rezerwacji
router.put("/:id", async (req, res) => {
  const { guest_name, guest_email, start_date, end_date, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE bookings 
       SET guest_name=$1, guest_email=$2, start_date=$3, end_date=$4, status=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [guest_name, guest_email, start_date, end_date, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Rezerwacja nie znaleziona" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Błąd przy aktualizacji rezerwacji:", err);
    res.status(500).json({ error: "Błąd serwera przy aktualizacji rezerwacji" });
  }
});

// ❌ Usuń rezerwację
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM bookings WHERE id=$1 RETURNING *", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Rezerwacja nie znaleziona" });
    }

    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    console.error("❌ Błąd przy usuwaniu rezerwacji:", err);
    res.status(500).json({ error: "Błąd serwera przy usuwaniu rezerwacji" });
  }
});

export default router;
