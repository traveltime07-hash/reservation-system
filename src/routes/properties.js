import express from "express";
import { pool } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware sprawdzający token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Brak tokena" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Nieprawidłowy token" });
  }
}

// Dodawanie nowego obiektu
router.post("/properties", authMiddleware, async (req, res) => {
  const { name, description, address } = req.body;

  if (!name) return res.status(400).json({ error: "Nazwa obiektu jest wymagana" });

  try {
    const result = await pool.query(
      "INSERT INTO properties (user_id, name, description, address) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.user.id, name, description, address]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pobieranie obiektów użytkownika
router.get("/properties", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM properties WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edycja obiektu
router.put("/properties/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, description, address } = req.body;

  try {
    const result = await pool.query(
      "UPDATE properties SET name=$1, description=$2, address=$3 WHERE id=$4 AND user_id=$5 RETURNING *",
      [name, description, address, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Obiekt nie znaleziony" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Usuwanie obiektu
router.delete("/properties/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM properties WHERE id=$1 AND user_id=$2 RETURNING *",
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Obiekt nie znaleziony" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
