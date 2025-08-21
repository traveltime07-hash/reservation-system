import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import crypto from "crypto";

const router = express.Router();

// ======================
// Rejestracja
// ======================
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashed]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ message: "Błąd: " + err.message });
  }
});

// ======================
// Logowanie
// ======================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ message: "Nieprawidłowy login" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Nieprawidłowe hasło" });

    await pool.query("UPDATE users SET last_login=NOW() WHERE id=$1", [user.id]);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Błąd: " + err.message });
  }
});

// ======================
// Dane użytkownika (me)
// ======================
router.get("/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Brak tokena" });

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query("SELECT id, email, created_at FROM users WHERE id=$1", [decoded.id]);
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(401).json({ message: "Błędny token" });
  }
});

// ======================
// Reset hasła — krok 1
// ======================
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ message: "Nie ma takiego użytkownika" });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1h ważności

    await pool.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, token, expires]
    );

    // Na razie tylko zwracamy link w JSON
    const resetLink = `${process.env.APP_URL}/reset-password.html?token=${token}`;
    res.json({ message: "Link resetujący wygenerowany", resetLink });
  } catch (err) {
    res.status(500).json({ message: "Błąd: " + err.message });
  }
});

// ======================
// Reset hasła — krok 2
// ======================
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM password_resets WHERE token=$1 AND expires_at > NOW()",
      [token]
    );
    const reset = result.rows[0];
    if (!reset) return res.status(400).json({ message: "Token nieprawidłowy lub wygasł" });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [hashed, reset.user_id]);

    // usuwamy token po użyciu
    await pool.query("DELETE FROM password_resets WHERE id=$1", [reset.id]);

    res.json({ message: "Hasło zmienione! Możesz się zalogować." });
  } catch (err) {
    res.status(500).json({ message: "Błąd: " + err.message });
  }
});

export default router;
