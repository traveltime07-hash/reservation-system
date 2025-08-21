import express from "express";
import { pool } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware sprawdzający token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);import express from "express";
import { pool } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware do sprawdzania tokena
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

  if (!name) {
    return res.status(400).json({ error: "Nazwa obiektu jest wymagana" });
  }

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
      "SELECT * FROM properties WHERE user_id = $1",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// ➕ Dodawanie obiektu
router.post("/properties", authenticateToken, async (req, res) => {
  try {
    const { name, address, description } = req.body;
    const result = await pool.query(
      `INSERT INTO properties (owner_id, name, address, description) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, name, address, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// 📋 Pobieranie obiektów zalogowanego użytkownika
router.get("/properties", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM properties WHERE owner_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

export default router;
