import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

// ===============================
// 🔹 Rejestracja użytkownika
// ===============================
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email i hasło są wymagane" });
    }

    // Sprawdź, czy użytkownik już istnieje
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Użytkownik z tym e-mailem już istnieje" });
    }

    // Hash hasła
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Zapisz użytkownika
    const newUser = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, hashedPassword]
    );

    res.status(201).json({
      message: "Użytkownik zarejestrowany pomyślnie",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// ===============================
// 🔹 Logowanie użytkownika
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sprawdź czy istnieje użytkownik
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Nieprawidłowy email lub hasło" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Nieprawidłowy email lub hasło" });
    }

    // Token JWT
    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Zapisz ostatnie logowanie
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.rows[0].id]);

    res.json({
      message: "Zalogowano pomyślnie",
      token,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

export default router;
