const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken } = require("../middleware/auth");

// ==============================
// GET all bookings (with filters)
// ==============================
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { property_id, room_id, start_date, end_date } = req.query;

    let query = `
      SELECT b.*, r.name AS room_name, p.name AS property_name, u.email AS owner_email
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN properties p ON r.property_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (property_id) {
      params.push(property_id);
      query += ` AND p.id = $${params.length}`;
    }
    if (room_id) {
      params.push(room_id);
      query += ` AND r.id = $${params.length}`;
    }
    if (start_date) {
      params.push(start_date);
      query += ` AND b.start_date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      query += ` AND b.end_date <= $${params.length}`;
    }

    query += " ORDER BY b.start_date ASC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==============================
// GET single booking
// ==============================
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT b.*, r.name AS room_name, p.name AS property_name
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN properties p ON r.property_id = p.id
      WHERE b.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==============================
// CREATE booking
// ==============================
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
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
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO bookings
      (room_id, guest_name, guest_phone, guest_email, start_date, end_date,
       adults, children, pets, total_price, deposit, due_date, notes, cleaning_task, safe_reminder)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *
      `,
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
        total_price || null,
        deposit || null,
        due_date || null,
        notes || null,
        cleaning_task || false,
        safe_reminder || false,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==============================
// UPDATE booking
// ==============================
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const {
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
    } = req.body;

    const result = await pool.query(
      `
      UPDATE bookings SET
        room_id=$1, guest_name=$2, guest_phone=$3, guest_email=$4,
        start_date=$5, end_date=$6, adults=$7, children=$8, pets=$9,
        total_price=$10, deposit=$11, due_date=$12, notes=$13,
        cleaning_task=$14, safe_reminder=$15
      WHERE id=$16
      RETURNING *
      `,
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
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==============================
// DELETE booking
// ==============================
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM bookings WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ message: "Booking deleted", booking: result.rows[0] });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
