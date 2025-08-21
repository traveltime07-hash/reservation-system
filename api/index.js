// api/index.js — handler Vercel
import app from '../src/app.js';
export default function handler(req, res) {
  return app(req, res);
}
