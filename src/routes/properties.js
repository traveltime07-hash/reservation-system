import express from "express";
import { pool } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ✅ Middleware do autoryzacji
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Brak tokenu" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // zapisujemy dane usera
    next();
  } catch (err) {
    res.status(403).json({ error: "Nieprawidłowy token" });
  }
}

// ✅ Pobierz wszystkie obiekty danego użytkownika
router.get("/properties", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM properties WHERE owner_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Dodaj nowy obiekt
router.post("/properties", authMiddleware, async (req, res) => {
  const { name, description, address, city, country } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO properties (owner_id, name, description, address, city, country)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, name, description, address, city, country]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Pobierz jeden obiekt
router.get("/properties/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM properties WHERE id = $1 AND owner_id = $2",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Nie znaleziono obiektu" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Edytuj obiekt
router.put("/properties/:id", authMiddleware, async (req, res) => {
  const { name, description, address, city, country } = req.body;
  try {
    const result = await pool.query(
      `UPDATE properties
       SET name=$1, description=$2, address=$3, city=$4, country=$5, updated_at=NOW()
       WHERE id=$6 AND owner_id=$7
       RETURNING *`,
      [name, description, address, city, country, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Nie znaleziono obiektu" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Usuń obiekt
router.delete("/properties/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM properties WHERE id = $1 AND owner_id = $2 RETURNING *",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Nie znaleziono obiektu" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
