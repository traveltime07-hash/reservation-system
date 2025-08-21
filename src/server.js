import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { pool } from "./db.js";
import authRouter from "./routes/auth.js";
import propertiesRouter from "./routes/properties.js";
import roomsRouter from "./routes/rooms.js";
import bookingsRouter from "./routes/bookings.js";
import paymentsRouter from "./routes/payments.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080'],
}));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Health-check
app.get("/api/health", async (req, res) => {
  try {
    const r = await pool.query("SELECT 1 as ok");
    res.json({ status: "ok", db: r.rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// ✅ API routers
app.use("/api/auth", authRouter);
app.use("/api", propertiesRouter);
app.use("/api", roomsRouter);
app.use("/api", bookingsRouter);
app.use("/api/payments", paymentsRouter);

// ✅ Serwujemy pliki z folderu public
app.use(express.static(path.join(__dirname, "../public")));

// ✅ Fix 404 – catch-all na frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ✅ Debug env
app.get("/api/debug-env", (req, res) => {
  res.json({
    databaseUrl: process.env.DATABASE_URL ? "OK - found" : "NOT FOUND",
    raw: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.substring(0, 50) + "..."
      : null,
  });
});

export default app;
// test JWT_SECRET
app.get('/api/debug-secret', (req, res) => {
  res.json({
    jwt: process.env.JWT_SECRET ? "OK - JWT_SECRET found" : "NOT FOUND"
  });
});
