<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/banner-dark.svg">
  <img alt="Rondo" src="docs/banner.svg">
</picture>

# Rondo

A simple score tracker for friendly playing groups. Everyone plays with and against everyone, partners change every round, and each win earns a star.

## What it is

You and your friends meet for a table tennis evening. Rondo decides who plays together, so nobody keeps getting the same partner and everyone gets to sit out equally. You tap the winning team at each table, the stars add up, and the standings are always up to date, also on a big screen next to the table. It works on a phone, in English and German.

The first game mode is the **Sternchenturnier** ("little star tournament"): two teams of two play doubles, both winners get a star, then partners and opponents are reshuffled.

## What it is not

Rondo is not professional tournament software. There are no brackets, seeding, rankings by federation or referees. It is for normal groups who want a fair, fun, low-effort way to keep score.

## Where it is going

The plan is to grow it from a single evening into a home for a group:

- groups with a leaderboard over many evenings and seasons
- profiles with history: best partners, head-to-head, streaks
- people join with a link, no account needed to appear on the leaderboard
- more casual game modes beyond table tennis doubles (darts, board games, anything with rounds and winners)

The look stays friendly and plain: sharp, flat and warm, with stars as the reward. See `DESIGN.md`.

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

A static export (`npm run build` writes `out/`), published to GitHub Pages by `.github/workflows/deploy.yml` on every push. Set the repository variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `CUSTOM_DOMAIN` if you use your own domain.

## Where things are

- `app/`: pages (`/`, `/display` for a monitor, `/legal`)
- `components/`: screens and pieces; `components/ui/` are the shadcn base components
- `lib/tournament.ts`: pairing and standings (the cost function is explained at the top)
- `lib/store.tsx`, `lib/use-cloud.ts`, `lib/cloud.ts`: state, online saving, Supabase
- `lib/legal.ts`: terms and privacy text; fill in `OPERATOR` at the top
- `PRODUCT.md`, `DESIGN.md`: what the product is and how it looks
- `docs/asset-brief.md`: brief for the icon and the README banner
