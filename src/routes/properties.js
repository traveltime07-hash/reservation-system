import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// 🔹 Pobierz wszystkie obiekty
router.get("/properties", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM properties ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera przy pobieraniu obiektów." });
  }
});

// 🔹 Pobierz jeden obiekt po ID
router.get("/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM properties WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Obiekt nie został znaleziony." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera przy pobieraniu obiektu." });
  }
});

// 🔹 Dodaj nowy obiekt
router.post("/properties", async (req, res) => {
  try {
    const { name, description, location } = req.body;
    const result = await pool.query(
      "INSERT INTO properties (name, description, location) VALUES ($1, $2, $3) RETURNING *",
      [name, description, location]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera przy dodawaniu obiektu." });
  }
});

// 🔹 Edytuj obiekt
router.put("/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location } = req.body;

    const result = await pool.query(
      "UPDATE properties SET name = $1, description = $2, location = $3 WHERE id = $4 RETURNING *",
      [name, description, location, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Obiekt nie został znaleziony." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera przy edycji obiektu." });
  }
});

// 🔹 Usuń obiekt
router.delete("/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM properties WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Obiekt nie został znaleziony." });
    }

    res.json({ message: "Obiekt został usunięty." });
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera przy usuwaniu obiektu." });
  }
});

export default router;
