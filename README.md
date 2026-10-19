# Studentport — Personal Learning Journey

Formative assessment app (mastery learning). Split deploy:

```
Browser → Vercel (UI + rewrite /api)
              ↓
       Render Free (Express)
              ↓
       Neon Free (Postgres)
              ↓
       Gemini API (optional)
```

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000  
Local data uses `data/learning_journey_db.json` until `DATABASE_URL` is set.

## Deploy (isi key, lalu connect)

### 1. Neon

1. Create a Free project: https://console.neon.tech
2. Copy the **pooled** connection string (`sslmode=require`).

### 2. Render (API)

1. New Web Service from `https://github.com/pocongcyber77/studentport`
2. Name the service **`studentport-api`** so the URL is `https://studentport-api.onrender.com` (matches `vercel.json`).
3. Build: `npm install` · Start: `npm run start`
4. Env:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `SERVE_STATIC` | `false` |
| `DATABASE_URL` | Neon pooled URI |
| `FRONTEND_ORIGIN` | `https://YOUR-APP.vercel.app` |
| `GEMINI_API_KEY` | optional |

Health: `https://studentport-api.onrender.com/api/health`

If Render gives a different hostname, change the rewrite `destination` in `vercel.json` (and redeploy Vercel).

### 3. Vercel (UI)

1. Import the same GitHub repo.
2. Framework: Vite · Output: `dist` · Build: `npm run build`
3. Env (optional fallback if rewrite host differs):

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://studentport-api.onrender.com` |

Leave `VITE_API_URL` empty to use `/api` on the Vercel domain (rewritten to Render).

4. After the Vercel URL exists, put it in Render `FRONTEND_ORIGIN`.

### 4. Gemini (optional)

Without a key, assessment scoring still works; feedback uses the built-in fallback.

## Scripts

- `npm run lint` — TypeScript check
- `npm run build` — production UI (`dist/`)
- `npm run start` — Express API (production on Render)
