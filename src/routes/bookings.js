import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// check availability
router.get('/availability', async (req, res) => {
  const { room_id, from, to } = req.query;
  if (!room_id || !from || !to) return res.status(400).json({ error: 'Parametry: room_id, from, to' });

  const { rows } = await pool.query(
    `SELECT COUNT(*)::int as count
     FROM bookings
     WHERE room_id=$1
       AND status IN ('pending','paid')
       AND daterange(start_date, end_date, '[]') && daterange($2::date, $3::date, '[]')`,
    [room_id, from, to]
  );
  const busy = rows[0].count > 0;
  res.json({ available: !busy });
});

// create booking
router.post('/bookings', async (req, res) => {
  const { room_id, from, to, customer_name, customer_email } = req.body;
  if (!room_id || !from || !to || !customer_email) {
    return res.status(400).json({ error: 'Brak wymaganych pól' });
  }
  const { rows: roomRows } = await pool.query('SELECT id, price_per_night FROM rooms WHERE id=$1', [room_id]);
  if (!roomRows.length) return res.status(404).json({ error: 'Pokój nie istnieje' });

  const { rows } = await pool.query(
    `INSERT INTO bookings (room_id, start_date, end_date, status, customer_name, customer_email)
     VALUES ($1, $2, $3, 'pending', $4, $5)
     RETURNING id, status`,
    [room_id, from, to, customer_name || null, customer_email]
  );

  // payment link (stub)
  const bookingId = rows[0].id;
  const payment_url = \`/api/payments/simulate?booking_id=\${bookingId}\`;

  res.status(201).json({ id: bookingId, status: 'pending', payment_url });
});

export default router;
