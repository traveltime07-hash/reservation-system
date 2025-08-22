const express = require("express");
const router = express.Router();
const db = require("../db");

// 📌 Lista rezerwacji użytkownika (host widzi tylko swoje)
router.get("/", async (req, res) => {
  try {
    let query = `
      SELECT b.*, r.name AS room_name, p.name AS property_name
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN properties p ON r.property_id = p.id
    `;
    let params = [];

    if (req.user.role !== "admin") {
      query += " WHERE p.user_id = $1";
      params.push(req.user.id);
    }

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Błąd GET /bookings:", err);
    res.status(500).json({ error: "Błąd pobierania rezerwacji" });
  }
});

// 📌 Szczegóły jednej rezerwacji
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let query = `
      SELECT b.*, r.name AS room_name, p.name AS property_name
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN properties p ON r.property_id = p.id
      WHERE b.id = $1
    `;
    const params = [id];

    const { rows } = await db.query(query, params);
    if (rows.length === 0) return res.status(404).json({ error: "Rezerwacja nie znaleziona" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Błąd GET /bookings/:id:", err);
    res.status(500).json({ error: "Błąd pobierania rezerwacji" });
  }
});

// 📌 Dodaj rezerwację
router.post("/", async (req, res) => {
  try {
    const {
      room_id,
      start_date,
      end_date,
      guest_name,
      guest_phone,
      guest_email,
      adults,
      children,
      pets,
      total_price,
      deposit,
      due_date,
      notes,
      cleaning_task,
      safe_reminder
    } = req.body;

    if (!room_id || !start_date || !end_date || !guest_name) {
      return res.status(400).json({ error: "Brak wymaganych pól" });
    }

    const result = await db.query(
      `INSERT INTO bookings 
      (room_id, guest_name, guest_phone, guest_email, start_date, end_date, 
       adults, children, pets, total_price, deposit, due_date, notes, 
       cleaning_task, safe_reminder) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) 
      RETURNING *`,
      [
        room_id,
        guest_name,
        guest_phone,
        guest_email,
        start_date,
        end_date,
        adults || 1,
        children || 0,
        pets || false,
        total_price || 0,
        deposit || 0,
        due_date || null,
        notes || "",
        cleaning_task || false,
        safe_reminder || false
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Błąd POST /bookings:", err);
    res.status(500).json({ error: "Błąd dodawania rezerwacji" });
  }
});

// 📌 Edytuj rezerwację
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      room_id,
      start_date,
      end_date,
      guest_name,
      guest_phone,
      guest_email,
      adults,
      children,
      pets,
      total_price,
      deposit,
      due_date,
      notes,
      cleaning_task,
      safe_reminder
    } = req.body;

    const result = await db.query(
      `UPDATE bookings SET
        room_id=$1, guest_name=$2, guest_phone=$3, guest_email=$4,
        start_date=$5, end_date=$6, adults=$7, children=$8, pets=$9,
        total_price=$10, deposit=$11, due_date=$12, notes=$13,
        cleaning_task=$14, safe_reminder=$15
      WHERE id=$16
      RETURNING *`,
      [
        room_id,
        guest_name,
        guest_phone,
        guest_email,
        start_date,
        end_date,
        adults,
        children,
        pets,
        total_price,
        deposit,
        due_date,
        notes,
        cleaning_task,
        safe_reminder,
        id
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Rezerwacja nie znaleziona" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Błąd PUT /bookings/:id:", err);
    res.status(500).json({ error: "Błąd edycji rezerwacji" });
  }
});

// 📌 Usuń rezerwację
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM bookings WHERE id=$1 RETURNING id", [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: "Rezerwacja nie znaleziona" });
    res.json({ message: "Rezerwacja usunięta" });
  } catch (err) {
    console.error("Błąd DELETE /bookings/:id:", err);
    res.status(500).json({ error: "Błąd usuwania rezerwacji" });
  }
});

module.exports = router;
