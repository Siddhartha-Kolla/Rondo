---
name: Sternchenturnier
description: A square-edged, monospaced, near-monochrome tournament scoreboard with a single table-tennis blue accent.
colors:
  ink: "oklch(0.205 0 0)"
  paper: "oklch(1 0 0)"
  page-text: "oklch(0.145 0 0)"
  chalk: "oklch(0.97 0 0)"
  hairline: "oklch(0.922 0 0)"
  muted-text: "oklch(0.556 0 0)"
  focus-ring: "oklch(0.708 0 0)"
  table-blue: "oklch(0.488 0.243 264.376)"
  foul-red: "oklch(0.577 0.245 27.325)"
  night-paper: "oklch(0.145 0 0)"
  night-card: "oklch(0.205 0 0)"
  night-text: "oklch(0.985 0 0)"
typography:
  body:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
rounded:
  none: "0"
  base: "0.625rem"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.none}"
    height: "32px"
    padding: "0 10px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.page-text}"
    rounded: "{rounded.none}"
    height: "32px"
    padding: "0 10px"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.page-text}"
    rounded: "{rounded.none}"
    height: "32px"
    padding: "0 10px"
---

# Design System: Sternchenturnier

## Overview

**Creative North Star: "The Scoreboard"**

The interface reads like a scoreboard bolted to the wall of a sports hall: technical, flat, square-edged, and glanceable from the next table over. Everything is set in a monospaced face, so names, numbers and pairings line up in columns and nothing competes with the one fact a player needs: where they play and with whom. The system is a tool first. It is built on the stock shadcn "lyra" preset (neutral base, square controls), so its character comes from restraint and alignment, not decoration.

Color is nearly absent. Ink on paper carries the interface, and a single blue, taken from the project's existing blue token, is reserved for the table-tennis-table graphic and the actions tied to it. Depth is never shadowed: surfaces are flat and separated by hairlines and tone.

It is professional first and playful second. The playfulness is structural, not decorative: points, ranks and streaks are the game layer, shown as stars (a nod to "Sternchen"), counters and segmented bars drawn in the same square, single-weight vocabulary as the rest of the interface. Nothing bounces, glows or cartoons. The app also ships in several languages, so layout must survive text that is 30% longer than English.

**Key Characteristics:**
- Gamified through data (stars, ranks, streaks, progress), never through ornament.
- Multilingual by construction: no fixed-width labels, no text baked into graphics.
- Monospaced throughout; columns align, numbers scan.
- Square corners on everything interactive (see The Square Edge Rule).
- Near-monochrome neutrals plus one blue accent.
- Flat surfaces, hairline borders, no shadows.
- Usable one-handed on a phone at the table.

## Colors

A grayscale scoreboard with one sharp blue. Values are the shadcn neutral tokens already in `app/globals.css`; the dark theme swaps the neutrals and keeps the blue.

### Primary
- **Scoreboard Ink** (oklch(0.205 0 0)): The primary action fill and strong text on light surfaces. In dark mode the primary role flips to a light gray (oklch(0.922 0 0)).

### Secondary
- **Table Blue** (oklch(0.488 0.243 264.376)): The only chromatic accent. Used for the table graphic, its selectable quarters, and the primary action tied to a round. Taken from the existing `--sidebar-primary` dark-mode token, the only blue the project defines. Not yet wired into the light theme; adopting it there is an implementation decision.

### Neutral
- **Paper** (oklch(1 0 0)): Page and card background in light mode.
- **Page Text** (oklch(0.145 0 0)): Body text; also the dark-mode page background (Night Paper).
- **Chalk** (oklch(0.97 0 0)): Muted, secondary and accent surfaces; hover fills.
- **Hairline** (oklch(0.922 0 0)): Borders and dividers; in dark mode a 10% white line.
- **Muted Text** (oklch(0.556 0 0)): Secondary labels such as the "Sitting out" line.
- **Focus Ring** (oklch(0.708 0 0)): Keyboard focus.
- **Foul Red** (oklch(0.577 0.245 27.325)): Destructive actions and invalid states only.
- **Night Card** (oklch(0.205 0 0)) and **Night Text** (oklch(0.985 0 0)): Dark-mode card and text.

### Named Rules
**The One Blue Rule.** Table Blue is the only chromatic color on any screen, and it marks the table. If a second hue appears, it is Foul Red for an error, nothing else.

## Typography

**Display Font:** JetBrains Mono (with ui-monospace fallback)
**Body Font:** JetBrains Mono
**Label/Mono Font:** JetBrains Mono

**Character:** One monospaced family for everything. It gives the app its scoreboard voice and lets columns of names and counts align without extra layout work. Geist Sans is loaded as `--font-geist-sans` but the root applies the mono face; treat sans as unused.

### Hierarchy
- **Body** (400, 0.75rem, default line-height): Round contents, names, helper text.
- **Label** (500, 0.75rem): Button text and field labels.
- Larger display and headline sizes are not yet defined in the code; add them when a surface needs them rather than inventing them here.

### Named Rules
**The Column Rule.** Names and numbers that belong together share a monospaced column. Never switch to a proportional face for data.

## Layout

No grid or container system exists yet. The home page is a single centered flex column (`flex flex-col items-center justify-center`) with a controls strip above a stack of rounds; each round is a row of table matches with a smaller line beneath it. Spacing uses the Tailwind 4px step (`gap-1`, `gap-2`, `mb-2`, `mb-4`).

Product direction for the next surfaces: phone-first, one-handed at the table, with the table graphic and round list as the primary content. Exact breakpoints are not yet set.

**Layout is rule-based, not improvised.** Every screen uses the 4px step scale, one content column on phone, and left-aligned data columns. Spacing between related items is `gap-1` or `gap-2`, between groups `gap-4`. A new element joins an existing row or column; it does not invent its own position.

**Multilingual.** Labels size to their content (min-width, never a fixed width such as `w-24`), wrap rather than truncate player-facing text, and allow roughly 30% growth for German. All strings come from a translation table; no text is embedded in images or SVG. The language is set on `<html lang>`. JetBrains Mono covers Latin, Cyrillic and Greek; a CJK language would need a fallback face, decided when one is added.

## Elevation & Depth

Flat by default. No box-shadows are used anywhere. Depth is expressed with tone (Paper against Chalk) and hairline borders. The only feedback is state-based: a 1px press translate on buttons, and a focus ring.

### Named Rules
**The Flat-By-Default Rule.** Surfaces carry no shadow at rest or on hover. Hierarchy comes from tone, borders and position.

## Shapes

Square, crisp edges on all interactive elements: buttons use `rounded-none`. The preset also defines a radius token (0.625rem, with 0.6x to 2.6x multiples) for cards and fields; use it for large containers only when needed, never on controls. The current round boxes in `app/page.tsx` use fully rounded pills; that is a placeholder to be replaced, not part of the system.

### Named Rules
**The Square Edge Rule.** Controls and status labels have no rounding. Rounded shapes are reserved for the table graphic if its design calls for it.

## Components

### Buttons
Tactile and confident, but quiet.
- **Shape:** Square corners (0), 1px transparent border, 32px tall by default, 10px side padding, 12px medium-weight label.
- **Primary:** Scoreboard Ink fill with Chalk-white text; hover lightens to 80% opacity.
- **Outline:** Paper fill with a Hairline border; hover fills with Chalk.
- **Ghost:** No fill; hover fills with Chalk.
- **Hover / Focus / Active:** Color fade on `transition-all`; focus shows a 1px ring in Focus Ring at 50%; press nudges down 1px; disabled fades to 50%.
- Also available: secondary, destructive, link, and size variants (xs, sm, lg, icon).

### Game Layer (planned)
The playful elements, all built from the same square, flat parts:
- **Stars:** one filled star per point won, drawn as an inline SVG or a Phosphor icon (the project's icon library), in Ink; Table Blue only for the current leader. Stars are glyphs in the system's style, never emoji.
- **Rank:** a monospaced numeral in a fixed-width column (`01`, `02`), leader row marked with a 1px Table Blue left rule.
- **Progress / streak:** segmented bars made of square cells separated by 1px gaps, filled with Ink; no rounded caps, no gradients.
- **Feedback:** a result entry changes the row state instantly (fill from Paper to Chalk, star appears). Motion is limited to a short fade; no bounce, confetti or glow.

### Display (monitor view)
`/display` is a read-only screen for a monitor or TV in a second window. Same square, flat vocabulary at a larger scale: type sized from viewport height, standings in pages of eight rows, and the current round's tables, alternating every 15 seconds. A small square Table Blue marker labels it live. Its only control is Fullscreen.

### Earlier Rounds
Closed by default. Each round is a bordered summary row (round name, results count) that opens to one bordered block per table; the winning team's row is shaded and starred, the losing row is muted.

### Header and Account
The header has two rows that never move: title with Open display and the language switch, then one status row with the open tournament's name and save status on the left and an Account button on the right ("Sign in" when signed out, the email when signed in). Account opens its own view instead of living inside Setup. The four tabs (Play, Standings, Tournaments when signed in, Setup) sit directly below.

### Save Status
One line that always says where the data lives: a 8px square marker plus text. Table Blue marker for "Saved online", muted for local, saving and offline, destructive for conflict, auth and error states. A small outline button (Reload) appears only on conflict. On the display page the same marker reads Live or Offline with the time of the last update.

### Player Profile
Opened by tapping a name in Standings (read-only display windows show plain names). An inline view with a Back button, not a modal. Plain bordered lists: a summary list, a form strip of ten 16px square cells (filled = won, outlined = lost, shaded = sat out, dashed = undecided, each with a tooltip), partner and opponent lists with games and wins, and a match log whose won rows are shaded and starred.

### Table Match (provisional)
The current implementation shows each match as "Table N: A & B vs C & D" in a pill with a Chalk fill. This is a placeholder pending the table-graphic design.

## Do's and Don'ts

### Do:
- **Do** use monospaced type for all names, counts and labels.
- **Do** keep every control square-cornered (`rounded-none`).
- **Do** use Table Blue only for the table graphic and its tied actions.
- **Do** separate surfaces with Hairline borders and tone, not shadows.
- **Do** design for a phone held in one hand at the table.
- **Do** express game state with stars, numerals and segmented bars in the system's own style.
- **Do** size labels to content and keep all text translatable.
- **Do** place new elements on the existing 4px step and column structure.

### Don't:
- **Don't** use emoji anywhere in the UI, including as icons or rewards.
- **Don't** use gradients, glows or glassy effects.
- **Don't** use borders thicker than 1px; selection and focus use tone and the 1px ring, not heavy outlines.
- **Don't** use more than one typeface or mix weights beyond regular and medium.
- **Don't** place elements by one-off margins or arbitrary widths; no fixed-width text boxes.
- **Don't** bake text into images or SVG.
- **Don't** add box-shadows.
- **Don't** round controls or labels into pills.
- **Don't** introduce a second accent hue; Foul Red is for errors only.
- **Don't** mix a proportional sans into data columns.
