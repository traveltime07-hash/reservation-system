const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Middleware: tylko admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ error: "Brak dostępu" });
}

// 📌 Lista użytkowników + wyszukiwanie
router.get("/users", isAdmin, async (req, res) => {
  try {
    const { email } = req.query;
    let query = "SELECT id, email, role, created_at, last_login, subscription_status, subscription_expires, is_active FROM users";
    let params = [];

    if (email) {
      query += " WHERE email ILIKE $1";
      params.push(`%${email}%`);
    }

    query += " ORDER BY created_at DESC";
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Błąd GET /admin/users:", err);
    res.status(500).json({ error: "Błąd pobierania użytkowników" });
  }
});

// 📌 Statystyki
router.get("/stats", isAdmin, async (req, res) => {
  try {
    const users = await db.query("SELECT COUNT(*) FROM users");
    const bookings = await db.query("SELECT COUNT(*) FROM bookings");
    const active = await db.query("SELECT COUNT(*) FROM users WHERE is_active = true");
    const inactive = await db.query("SELECT COUNT(*) FROM users WHERE is_active = false");

    res.json({
      total_users: parseInt(users.rows[0].count),
      total_bookings: parseInt(bookings.rows[0].count),
      active_users: parseInt(active.rows[0].count),
      inactive_users: parseInt(inactive.rows[0].count)
    });
  } catch (err) {
    console.error("Błąd GET /admin/stats:", err);
    res.status(500).json({ error: "Błąd pobierania statystyk" });
  }
});

// 📌 Reset hasła (symulacja wysłania linku)
router.post("/reset-password/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // W realnej wersji: wygenerowanie tokena + wysyłka e-maila
    console.log("RESET PASSWORD LINK for user ID:", id);
    res.json({ message: "Link resetu hasła został wysłany (symulacja)" });
  } catch (err) {
    console.error("Błąd POST /admin/reset-password:", err);
    res.status(500).json({ error: "Błąd resetu hasła" });
  }
});

// 📌 Nadaj nowe hasło ręcznie
router.post("/set-password/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ error: "Brak hasła" });

    const hashed = await bcrypt.hash(password, 10);
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [hashed, id]);

    res.json({ message: "Hasło zostało zmienione" });
  } catch (err) {
    console.error("Błąd POST /admin/set-password:", err);
    res.status(500).json({ error: "Błąd zmiany hasła" });
  }
});

// 📌 Zmień subskrypcję
router.post("/set-subscription/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { expires } = req.body;

    if (!expires) return res.status(400).json({ error: "Brak daty wygaśnięcia" });

    await db.query(
      "UPDATE users SET subscription_status = 'premium', subscription_expires = $1 WHERE id = $2",
      [expires, id]
    );

    res.json({ message: "Subskrypcja została zmieniona" });
  } catch (err) {
    console.error("Błąd POST /admin/set-subscription:", err);
    res.status(500).json({ error: "Błąd zmiany subskrypcji" });
  }
});

module.exports = router;
