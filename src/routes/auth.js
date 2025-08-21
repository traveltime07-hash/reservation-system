import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

// 🔑 Secret JWT (pobierany z .env)
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

// ======================
// REJESTRACJA
// ======================
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email i hasło są wymagane" });

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password, created_at) VALUES ($1, $2, NOW()) RETURNING id, email, created_at",
      [email, hashed]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Ten email jest już zajęty" });
    }
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// ======================
// LOGOWANIE
// ======================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0)
      return res.status(400).json({ message: "Nieprawidłowe dane logowania" });

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Nieprawidłowe dane logowania" });

    // Aktualizacja daty ostatniego logowania
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [
      user.id,
    ]);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// ======================
// SPRAWDZENIE TOKENA
// ======================
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Brak tokena" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      "SELECT id, email, created_at, last_login FROM users WHERE id = $1",
      [decoded.id]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    return res.status(401).json({ message: "Nieprawidłowy token" });
  }
});

export default router;
