const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/auth");
const propertiesRoutes = require("./routes/properties");
const roomsRoutes = require("./routes/rooms");
const bookingsRoutes = require("./routes/bookings");
const adminRoutes = require("./routes/admin"); // 📌 NOWE

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Middleware: sprawdzanie tokena
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Publiczne trasy
app.use("/auth", authRoutes);

// Prywatne trasy (wymagają tokena)
app.use("/properties", authenticateToken, propertiesRoutes);
app.use("/rooms", authenticateToken, roomsRoutes);
app.use("/bookings", authenticateToken, bookingsRoutes);
app.use("/admin", authenticateToken, adminRoutes); // 📌 NOWE

// Start serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server działa na porcie ${PORT}`);
});
