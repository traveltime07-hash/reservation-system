# System Rezerwacji — Deploy na Vercel + Supabase (krok po kroku)

Ta paczka jest przygotowana pod prosty deploy:
- **Vercel** (serverless API w `/api/index.js`, statyki w `/public`)
- **Supabase (Postgres)** — schemat w `db/schema.sql`, dane przykładowe w `db/seed.sql`

## Szybki start (Vercel + Supabase)
1) **Supabase**: stwórz projekt → w SQL Editor uruchom:
   - `db/schema.sql`, potem `db/seed.sql`
2) Skopiuj connection string z **Settings → Database** (zalecany wariant z pgbouncer i `sslmode=require`).
3) **Vercel**:
   - Podłącz repo (GitHub/itp.) lub wrzuć ręcznie.
   - W **Settings → Environment Variables** ustaw:
     - `DATABASE_URL` = connection string z Supabase (np. `...sslmode=require&pgbouncer=true&connection_limit=1`)
     - `JWT_SECRET` = silny losowy sekret
   - Deploy.
4) Test: `https://twoja-domena.vercel.app/api/health`
5) Front (MVP): `https://twoja-domena.vercel.app/`

## Lokalnie (opcjonalnie)
1) `npm install`
2) Utwórz `.env` (zob. `.env.example`)
3) Uruchom: `npm run dev`
   - API: `http://localhost:8080/api/health`
   - Front: `http://localhost:8080/`

Miłej pracy! ✨
