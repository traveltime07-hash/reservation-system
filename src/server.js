import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRouter from "./routes/auth.js";
import propertiesRouter from "./routes/properties.js";
import roomsRouter from "./routes/rooms.js";
import bookingsRouter from "./routes/bookings.js";  // ⬅ NOWY IMPORT

const app = express();

app.use(cors());
app.use(bodyParser.json());

// 🔑 logowanie/rejestracja
app.use("/api/auth", authRouter);

// 🏠 obiekty
app.use("/api/properties", propertiesRouter);

// 🛏 pokoje
app.use("/api/rooms", roomsRouter);

// 📖 rezerwacje
app.use("/api/bookings", bookingsRouter);   // ⬅ NOWY ROUTER

// Serwer startuje
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server działa na porcie ${PORT}`);
});
