export default function handler(req, res) {
  res.status(200).json({
    jwt: process.env.JWT_SECRET ? "OK - JWT_SECRET found" : "NOT FOUND",
  });
}
