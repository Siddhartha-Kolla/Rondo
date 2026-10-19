# Sternchenturnier

A tournament tool for table tennis doubles evenings: partners and opponents change every round, the winners of each match get a star, and the standings update live. Works in English and German, on a phone or on a big screen.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Without any setup, everything is saved in the browser. To save online and show live standings on another device, create a free Supabase project, run `supabase/schema.sql` in its SQL editor, and put these two public values in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

An existing database needs `supabase/migration-2026-10-19-share-and-delete.sql` once.

## Deploy

The site is a static export (`npm run build` writes `out/`). `.github/workflows/deploy.yml` publishes it to GitHub Pages on every push. Set the repository variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `CUSTOM_DOMAIN` if you use your own domain.

## Where things are

- `app/`: pages (`/`, `/display` for a monitor, `/legal`)
- `components/`: screens and pieces; `components/ui/` are the shadcn base components
- `lib/tournament.ts`: pairing and standings (the cost function is explained at the top)
- `lib/store.tsx`, `lib/use-cloud.ts`, `lib/cloud.ts`: state, online saving, Supabase
- `lib/legal.ts`: terms and privacy text; fill in `OPERATOR` at the top
- `PRODUCT.md`, `DESIGN.md`: what the product is and how it looks
