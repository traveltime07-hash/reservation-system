import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key"; // 🔑 ustaw w .env

// Rejestracja nowego użytkownika
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email i hasło są wymagane" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, hashedPassword]
    );

    res.json({ message: "Użytkownik zarejestrowany", user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ message: "Taki email już istnieje" });
    } else {
      res.status(500).json({ message: "Błąd serwera", error: err.message });
    }
  }
});

// Logowanie
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Nieprawidłowy email lub hasło" });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Nieprawidłowy email lub hasło" });
    }

    // token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // aktualizacja last_login
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);

    res.json({ message: "Zalogowano", token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

// Middleware do ochrony tras
export function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Brak tokenu" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Nieprawidłowy token" });
    req.user = user;
    next();
  });
}

export default router;
