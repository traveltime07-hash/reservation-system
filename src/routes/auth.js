import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const router = express.Router();

// ------------------------
// Rejestracja użytkownika
// ------------------------
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashed]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------
// Logowanie
// ------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Nieprawidłowy login lub hasło" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Nieprawidłowy login lub hasło" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------
// Dane zalogowanego usera
// ------------------------
router.get("/me", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Brak tokena" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Brak tokena" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      "SELECT id, email, created_at FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Użytkownik nie istnieje" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(401).json({ message: "Nieprawidłowy token" });
  }
});

export default router;
