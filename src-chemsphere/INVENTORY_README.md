Chemventory prototype

This workspace contains a prototype inventory UI added on top of the Vite + React template.

Quick start

1. Install dependencies and start dev server:

```bash
npm install
npm install react-router-dom
npm run dev
```

2. Open http://localhost:5173 (vite default)

Notes and environment variables

- VITE_GOOGLE_CLIENT_ID — If you have a Google OAuth client ID you can wire the AuthProvider to use Google Identity Services. The current implementation falls back to a prompt-based sign-in when the env var is not set.
- VITE_ADMIN_EMAILS — Comma-separated list of admin emails (for example: admin@example.com). Admin-only pages (Users) are hidden for non-admins.

Data

- Chemical data is stored in localStorage under key `chemicals_v1`.
- On first run the app seeds sample data from `src/data/sampleData.ts`.
- CSV import/export is available on the Chemicals page. Import accepts simple CSVs with columns like `name,batchNumber,initialQuantity,currentQuantity,expirationDate`.

Files added

- `src/context/AuthContext.tsx` — simple auth provider and admin detection.
- `src/routes/AppRoutes.tsx` — app routing and protected routes.
- `src/components/Sidebar.tsx` — sidebar navigation.
- `src/pages/*` — pages: Dashboard, Chemicals, Equipment (scaffold), Users, Profile, Login.
- `src/utils/storage.ts` — localStorage storage helpers for chemicals.
- `src/utils/csv.ts` — small CSV import/export helpers.

Limitations & next steps

- Google OAuth is not fully wired; add Google Identity Services client code and set `VITE_GOOGLE_CLIENT_ID`.
- The UI is intentionally minimal and can be replaced with shadcn components / Tailwind if desired.
- Add equipment CRUD, logs binding, audit log UI, and tests.
