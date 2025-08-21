export default function handler(req, res) {
  res.status(200).json({
    databaseUrl: process.env.DATABASE_URL ? "OK - found" : "NOT FOUND",
    raw: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.substring(0, 50) + "..."
      : null,
  });
}
