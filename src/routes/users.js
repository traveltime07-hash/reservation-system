import express from "express";
import { pool } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware autoryzacji
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Brak tokenu" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token nieprawidłowy" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token nieważny" });
  }
}

// Middleware tylko dla admina
function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Dostęp tylko dla administratora" });
  }
  next();
}

// 📌 Lista użytkowników
router.get("/users", authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email, role FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Błąd przy pobieraniu użytkowników:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// 📌 Usuń użytkownika
router.delete("/users/:id", authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Błąd przy usuwaniu użytkownika:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

export default router;
