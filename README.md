# Studentport — Personal Learning Journey

Formative assessment app (mastery learning). Stack:

```
Browser → Vercel (UI + /api serverless)
              ↓
       Neon Free (Postgres)
              ↓
       Gemini API (optional)
```

Tidak perlu Render — API jalan sebagai **Vercel Function** (`api/`), data di **Neon**.

## Run locally

```bash
npm install
neon env pull    # optional: isi .env.local dengan DATABASE_URL
npm run dev
```

Open http://localhost:3000  

Tanpa `DATABASE_URL` (atau tanpa `.env.local`), data pakai `data/learning_journey_db.json`.  
Dengan Neon: pastikan log `[DB] Loaded state from Postgres (Neon).`

## Deploy

### 1. Neon

1. Project Free: https://console.neon.tech  
2. Salin **pooled** connection string (`sslmode=require`).  
3. Lokal: `neon env pull` → `.env.local`

### 2. Vercel (UI + API)

1. Import repo: https://github.com/pocongcyber77/studentport  
2. Framework: Vite · Output: `dist` · Build: `npm run build`  
3. Environment variables (Production + Preview):

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Neon pooled URI (**wajib**) |
| `GEMINI_API_KEY` | opsional |
| `FRONTEND_ORIGIN` | opsional (URL Vercel Anda, untuk CORS ekstra) |

`VITE_API_URL` **kosongkan** — browser memanggil `/api/...` di domain yang sama.

4. Deploy, lalu cek: `https://<app>.vercel.app/api/health` → `storage: "neon"`

### 3. Gemini (optional)

Tanpa key, asesmen tetap jalan; umpan balik memakai fallback di server.

## Scripts

- `npm run lint` — TypeScript check  
- `npm run build` — production UI (`dist/`)  
- `npm run dev` — Vite + API lokal (port 3000)  
- `npx tsx scripts/provision-users-once.ts` — buat/update akun di Neon
