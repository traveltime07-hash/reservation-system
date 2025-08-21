import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Webhook stub - przyjmuje booking_id i status
router.post('/webhook', async (req, res) => {
  const { booking_id, status } = req.body;
  if (!booking_id || !status) return res.status(400).json({ error: 'booking_id, status' });

  const valid = ['paid', 'cancelled', 'failed'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Zły status' });

  await pool.query('UPDATE bookings SET status=$1 WHERE id=$2', [status, booking_id]);
  res.json({ ok: true });
});

// Endpoint do lokalnej/preview symulacji "płatności"
router.get('/simulate', async (req, res) => {
  const id = req.query.booking_id;
  if (!id) return res.status(400).send('Brak booking_id');
  await pool.query('UPDATE bookings SET status=$1 WHERE id=$2', ['paid', id]);
  res.send(`<html><body><h1>Symulacja płatności</h1><p>Rezerwacja #${id} oznaczona jako <b>paid</b>.</p><a href="/">Wróć</a></body></html>`);
});

export default router;
