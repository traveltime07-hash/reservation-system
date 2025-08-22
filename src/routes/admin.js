const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const { authenticateToken } = require("../middleware/auth");

// =========================================
// Middleware - sprawdzanie czy użytkownik to admin
// =========================================
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}

// =========================================
// GET all users (lista użytkowników z filtrami)
// =========================================
router.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, status } = req.query;

    let query = `
      SELECT id, email, role, created_at, last_login, 
             subscription_status, subscription_expires, is_active
      FROM users WHERE 1=1
    `;
    const params = [];

    if (email) {
      params.push(`%${email}%`);
      query += ` AND email ILIKE $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND subscription_status = $${params.length}`;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================================
// POST - reset hasła (wysłanie linku e-mail)
// =========================================
router.post(
  "/users/:id/reset-password",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      // Tu można dodać logikę generowania tokena i wysyłki e-mail
      // Na razie symulujemy
      const result = await pool.query(
        `SELECT email FROM users WHERE id=$1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const email = result.rows[0].email;
      console.log(`Reset password link sent to ${email}`);

      res.json({ message: `Reset link sent to ${email}` });
    } catch (err) {
      console.error("Error resetting password:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// =========================================
// POST - ustawienie nowego hasła przez admina
// =========================================
router.post(
  "/users/:id/set-password",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 4) {
        return res
          .status(400)
          .json({ error: "Password must be at least 4 characters long" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const result = await pool.query(
        `UPDATE users SET password=$1 WHERE id=$2 RETURNING id, email`,
        [hashedPassword, req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "Password updated successfully",
        user: result.rows[0],
      });
    } catch (err) {
      console.error("Error setting new password:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// =========================================
// PUT - aktualizacja subskrypcji użytkownika
// =========================================
router.put(
  "/users/:id/subscription",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { subscription_status, subscription_expires } = req.body;

      const result = await pool.query(
        `
        UPDATE users 
        SET subscription_status=$1, subscription_expires=$2
        WHERE id=$3
        RETURNING id, email, subscription_status, subscription_expires
        `,
        [subscription_status, subscription_expires, req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "Subscription updated successfully",
        user: result.rows[0],
      });
    } catch (err) {
      console.error("Error updating subscription:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
