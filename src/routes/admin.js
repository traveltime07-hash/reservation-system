import express from "express";
import { pool } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ✅ Middleware sprawdzający czy użytkownik to admin
function authAdmin(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Brak tokena" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Brak tokena" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Brak uprawnień (tylko admin)" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Nieprawidłowy token" });
  }
}

// ✅ Pobierz wszystkich użytkowników
router.get("/users", authAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email, role FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Zmień rolę użytkownika
router.put("/users/:id/role", authAdmin, async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ error: "Nieprawidłowa rola" });
  }

  try {
    await pool.query("UPDATE users SET role = $1 WHERE id = $2", [role, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Usuń użytkownika
router.delete("/users/:id", authAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
