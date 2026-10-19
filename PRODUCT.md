# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Tournament organizers who run table tennis evenings and enter results, and players who follow along on their own phones (see their table, partners and opponents, standings). Later, a wider audience using it for normal day-to-day tournament organizing.

## Product Purpose
A general tournament tool. The first format is the Sternchenturnier: players form rotating pairs, two pairs play doubles against each other, and each player on the winning pair gets one point. The next round assigns new partners and opponents. Success: every player gets fair rotation, with partners and opponents repeating as little as possible and sit-outs shared evenly.

## Positioning
Not yet decided. Working hypothesis: a flexible tournament manager whose formats are interchangeable assigners, starting with a fairness-driven Sternchenturnier assigner.

## Operating Context
Organizers set the number of players and tables, press "next round", and enter match winners. A round is all tables playing at the same time; players who don't fit on a table sit out that round. Used at the venue, so it must work on a phone.

## Capabilities and Constraints
- Existing stack: Next.js (App Router) with shadcn/ui components, in `tt/`. Note `tt/AGENTS.md`: this Next.js version has breaking changes, so consult `node_modules/next/dist/docs/` before writing code.
- Currently implemented: round generation from history (partner and opponent repeat cost, fair sit-out rotation), configurable table count, per-round table labels and sit-out list.
- Planned, not built: winner entry, points table, adding/removing players, other tournament formats, player-facing phone view.
- Undecided: persistence/accounts/backend, UI language (the term "Sternchenturnier" is German), how player-facing views are shared with the organizer.
- Must work on a phone.
- Multilingual: the UI will support several languages (confirmed 2026-10-19; which ones is undecided).
- Light gamification is wanted (points, ranks, streaks) while keeping a professional tone.

## Evidence on Hand
No real tournament data, customers or testimonials. Players are currently placeholders "1" to "16".

## Product Principles
- Fairness first: no player is privileged by position, sit-outs rotate, repeats are minimized.
- Formats are pluggable; Sternchenturnier is the first, not the only one.
- Usable at the table on a phone, by both organizers and players.
- Show the result of the assignment clearly: who plays where, with whom, and who sits out.
