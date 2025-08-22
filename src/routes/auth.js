import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

// ✅ Rejestracja
router.post("/register", async (req, res) => {
  console.log("➡️ /register hit:", req.body);

  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email i hasło są wymagane" });
  }

  try {
    // Sprawdź, czy użytkownik istnieje
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "Użytkownik już istnieje" });
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Wstaw nowego użytkownika (domyślna rola = "client")
    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, hashedPassword, role || "client"]
    );

    console.log("✅ Użytkownik zarejestrowany:", result.rows[0]);

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error("❌ Błąd w /register:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Logowanie
router.post("/login", async (req, res) => {
  console.log("➡️ /login hit:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email i hasło są wymagane" });
  }

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Nieprawidłowe dane logowania" });
    }

    const user = userResult.rows[0];

    // Sprawdź hasło
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Nieprawidłowe dane logowania" });
    }

    // Token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Użytkownik zalogowany:", user.email);

    // UWAGA → teraz zwracamy również `role`
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("❌ Błąd w /login:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
