const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Middleware sprawdzający rolę admina
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Dostęp tylko dla administratora" });
  }
  next();
}

// 📌 Lista użytkowników (z opcjonalnym wyszukiwaniem po e-mailu)
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const search = req.query.search || "";
    const result = await pool.query(
      `SELECT id, email, role, created_at, last_login, is_active, subscription_status, subscription_expires
       FROM users
       WHERE email ILIKE $1
       ORDER BY created_at DESC`,
      [`%${search}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Błąd pobierania użytkowników:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// 📌 Statystyki
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const activeUsers = await pool.query("SELECT COUNT(*) FROM users WHERE is_active = true");
    const inactiveUsers = await pool.query("SELECT COUNT(*) FROM users WHERE is_active = false");
    const totalBookings = await pool.query("SELECT COUNT(*) FROM bookings");

    res.json({
      active_users: parseInt(activeUsers.rows[0].count, 10),
      inactive_users: parseInt(inactiveUsers.rows[0].count, 10),
      total_bookings: parseInt(totalBookings.rows[0].count, 10)
    });
  } catch (err) {
    console.error("Błąd statystyk:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// 📌 Reset hasła – wysłanie linku (placeholder, do wdrożenia e-mail)
router.post("/users/:id/reset-password", requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }

    const email = result.rows[0].email;
    console.log(`📧 Wysłano link resetu hasła na ${email} (do zaimplementowania system e-mail)`);

    res.json({ message: "Wysłano link resetujący (symulacja)" });
  } catch (err) {
    console.error("Błąd resetu hasła:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// 📌 Nadanie nowego hasła ręcznie
router.post("/users/:id/set-password", requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Brak hasła" });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashed, userId]);

    res.json({ message: "Hasło zaktualizowane" });
  } catch (err) {
    console.error("Błąd ustawiania hasła:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// 📌 Edycja subskrypcji
router.post("/users/:id/subscription", requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { subscription_expires } = req.body;

    await pool.query(
      "UPDATE users SET subscription_status = 'premium', subscription_expires = $1 WHERE id = $2",
      [subscription_expires, userId]
    );

    res.json({ message: "Subskrypcja zaktualizowana" });
  } catch (err) {
    console.error("Błąd subskrypcji:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

module.exports = router;
