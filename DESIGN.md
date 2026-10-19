---
name: Sternchenturnier
description: A sharp, warm tournament scoreboard in a friendly sans-serif, with table blue for action and ball orange for stars.
colors:
  paper: "#FAF8F4"
  card: "#FFFFFF"
  ink: "#1E1B16"
  chalk: "#F1EDE5"
  hairline: "#E4DFD6"
  muted-text: "#6B655B"
  table-blue: "#2F5FD0"
  ball-orange: "#D4680C"
  court-amber: "#FFC266"
  foul-red: "oklch(0.577 0.245 27.325)"
  night-paper: "#10141C"
  night-card: "#171C26"
  night-ink: "#EDEAE4"
  night-hairline: "#2A3140"
  night-blue: "#3F6FE3"
  night-orange: "#F5A04A"
typography:
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
  numeral:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
rounded:
  none: "0"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
components:
  button-primary:
    backgroundColor: "{colors.table-blue}"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    height: "40px"
    padding: "0 12px"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "40px"
    padding: "0 12px"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "40px"
    padding: "0 12px"
---

# Design System: Sternchenturnier

## Overview

**Creative North Star: "The Scoreboard"**

The interface is a scoreboard in a friendly club hall: flat, square-edged and glanceable, but warm. Everything keeps the crisp structure of a scoreboard (square corners, 1px lines, no shadows), while the colour, the letters and a few small drawn details make it welcoming for people who just want a good evening of table tennis.

The text is a clean sans-serif, and only numbers (ranks, stars, games, streaks) use the monospaced face so that columns line up. Colour is restrained: warm paper and ink, one table blue for action and for the table, and ball orange reserved for stars. The game layer is played through data and small details, never through ornament: stars, initials tiles, a crown, a flame, and a few short moments of motion.

**Key Characteristics:**
- Sharp and flat: square corners, 1px borders, no shadows, no gradients, no emoji.
- Warm paper and ink; blue for action, orange only for stars and winners.
- Sans-serif for text, monospace for numbers.
- Game state shown as data: stars, rank, streak, segmented bars, initials tiles.
- Short, plain wording; no explanatory text where the interface already says it.
- Multilingual by construction: labels size to content, no fixed-width text.
- Usable one-handed on a phone: 40px controls, 44px tabs.

## Colors

Warm neutrals with two accents. Values are the tokens in `app/globals.css`; the dark theme uses a navy-gray ground.

### Primary
- **Table Blue** (#2F5FD0): primary buttons, the table graphic, focus ring, and the 1px rule marking the leader's row. Slightly lighter in dark mode (#3F6FE3).

### Secondary
- **Ball Orange** (#D4680C): stars on paper (standings, earlier rounds, profile), the crown on the leader. Use for icons and fills only, never for small text. Brighter in dark mode (#F5A04A).
- **Court Amber** (#FFC266): the winner's star on the blue table, where deeper orange would not stand out.

### Neutral
- **Paper** (#FAF8F4): page background.
- **Card** (#FFFFFF): inputs, outline buttons, bordered blocks.
- **Ink** (#1E1B16): text and the filled cells of the standings bar.
- **Chalk** (#F1EDE5): muted and hover surfaces, winning row, initials tile base.
- **Hairline** (#E4DFD6): borders and dividers.
- **Muted Text** (#6B655B): secondary text (5.4:1 on paper).
- **Foul Red**: destructive actions and errors only.

### Named Rules
**The Two Accents Rule.** Table Blue means "act" or "the table". Ball Orange means "a star was earned". No third accent hue appears, except Foul Red for errors.

## Typography

**Text Font:** Geist Sans (with system-ui fallback)
**Numeral Font:** JetBrains Mono

**Character:** Plain and friendly letters for names and labels, with a technical monospaced voice reserved for the numbers.

### Hierarchy
- **Body** (400, 0.875rem, 1.43): lists, helper text, table labels.
- **Title** (500, 1rem): the app name and section headings.
- **Label** (500, 0.875rem): buttons and field labels.
- **Numeral** (mono, tabular): rank, stars, games, streak, times.

### Named Rules
**The Column Rule.** Numbers that belong together share a monospaced column. Names are never set in mono.

## Layout

A single centered column (max 48rem) with a 16px side gutter, built on the 4px step. A header block comes first: title with Open display and the language switch, then one status row (tournament name and save status on the left, Account button on the right). The tabs follow, then the content. Related items sit close (gap 4 to 8px); groups are separated by 16px and a hairline.

**Layout is rule-based.** New elements join an existing row or column; they never get one-off margins or fixed widths. Labels size to their content and wrap, and allow about 30% growth for German.

**Multilingual.** All text comes from the translation table; none is baked into graphics. The document language follows the chosen language.

## Elevation & Depth

Flat. No shadows anywhere. Depth is tone (Paper against Card and Chalk) and 1px hairlines. State feedback is a 1px press and a 1px focus ring.

### Named Rules
**The Flat-By-Default Rule.** Surfaces carry no shadow at rest or on hover.

## Shapes

Square and crisp: every control, tab, input, block and the table graphic has square corners. Borders are never thicker than 1px.

### Named Rules
**The Square Edge Rule.** Nothing is rounded into a pill or a card. Warmth comes from colour, letters and small details, not from soft corners.

## Components

### Buttons
Confident and quiet.
- **Shape:** square, 40px tall (44px for tabs, 36px small), 12px side padding, 14px medium label.
- **Primary:** Table Blue fill, white text; hover 80% opacity.
- **Outline:** Card fill with a Hairline border; hover Chalk.
- **Ghost:** no fill; hover Chalk.
- **States:** 1px focus ring in the blue ring colour, 1px press, disabled at 50%.

### Initials Tile
A 24px square with the player's initials (mono, 11px) beside names in the standings and the profile. Four soft tints (blue, orange, chalk, deeper blue) chosen from the name, so a person keeps the same tile.

### Icons
Drawn Phosphor icons only: a paddle before each table label, a filled crown on the leader, a flame beside a streak of three or more, a filled star for every win. No emoji.

### Motion
Three short moments, all switched off for reduced-motion users: a 180ms pop when a winner's star appears, a 240ms staggered fill of the standings bar cells, and a single gentle pulse on "Next round" when every table is decided.

### Table Graphic
A blue table in 2:3 proportion with a white court edge and center line, a net with posts, and the two teams' names in the four serve boxes. Each half is a "this team won" button. The winner keeps a Court Amber star; the other half is dimmed. Capped at 16rem wide.

### Header and Account
Two rows that never move: title with Open display and the language switch, then a status row with the open tournament's name and save status on the left and an Account button on the right ("Sign in", or the email once signed in). Account opens its own view. The tabs (Play, Standings, Tournaments when signed in, Setup) sit directly below.

### Save Status
One line that says where the data lives: an 8px square marker plus text. Blue marker for "Saved online", muted for local, saving and offline, destructive for conflict, auth and error. A small outline button (Reload) appears only on conflict.

### Display (monitor view)
`/display` is a read-only screen for a monitor or TV. The same vocabulary at larger scale: type sized from the viewport height, standings in pages of eight rows, alternating every 15 seconds with the current round's tables. A small square marker reads Live or Offline with the time of the last update; its only control is Fullscreen.

### Earlier Rounds
Closed by default. Each round is a bordered summary row (name and results count) that opens into one bordered block per table; the winning team's row is shaded and starred, the losing row is muted.

### Player Profile
Opened by tapping a name in Standings (display windows show plain names). An inline view with a Back button. A summary list, a form strip of ten 16px square cells (filled = won, outlined = lost, shaded = sat out, dashed = undecided, each with a tooltip), partner and opponent lists with games and wins, and a match log whose won rows are shaded and starred.

## Do's and Don'ts

### Do:
- **Do** keep every control, tab, input and block square-cornered, with 1px borders.
- **Do** use Table Blue for action and the table, and Ball Orange only for stars and the leader.
- **Do** set names and labels in the sans face, and numbers in the monospaced face.
- **Do** show game state as data (stars, rank, streak, bars, tiles) in the system's own style.
- **Do** keep wording short; leave out text the interface already makes clear.
- **Do** size labels to content, keep all text translatable, and place new elements on the 4px step and existing columns.
- **Do** design for a phone held in one hand at the table.

### Don't:
- **Don't** use emoji, gradients, glows or shadows.
- **Don't** use borders thicker than 1px or round controls into pills.
- **Don't** introduce another accent hue; Foul Red is for errors only.
- **Don't** set Ball Orange as small text; use it for icons and fills.
- **Don't** mix a proportional face into number columns.
- **Don't** place elements by one-off margins or fixed-width text boxes, or bake text into images.
- **Don't** add decorative motion beyond the three authored moments.
