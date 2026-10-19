# Brief: app icon and README banner

Hand this file to the agent or designer who makes the brand assets. Read `DESIGN.md` and `PRODUCT.md` first; this brief only adds what those do not say.

## The product in one line

Rondo is a friendly score tracker for playing groups: partners rotate every round ("rondo" is a round dance), each win earns a star, and the standings are always visible. Warm and casual, not corporate and not "pro sports".

## Deliverables

All assets are **SVG**, hand-written or exported as clean vector paths. No embedded raster images.

| File | Purpose | Size / viewBox |
|---|---|---|
| `app/icon.svg` | The icon. Next.js uses it as the favicon automatically. | square, `viewBox="0 0 64 64"` |
| `public/icon-mono.svg` | One-colour version using `currentColor`, for reuse in UI and docs. | square, `viewBox="0 0 64 64"` |
| `docs/banner.svg` | README banner, light theme. | `viewBox="0 0 1280 320"` |
| `docs/banner-dark.svg` | README banner, dark theme (same layout). | `viewBox="0 0 1280 320"` |

Optional, only if cheap: `app/apple-icon.png` (180x180, exported from the icon) and `app/opengraph-image.png` (1200x630, link preview).

After adding the banner files, replace the `BANNER PLACEHOLDER` comment at the top of `README.md` with the `<picture>` snippet written in that comment. Change nothing else in the code.

## Design rules (from DESIGN.md, non-negotiable)

- **Sharp and flat.** Square corners, 1px-style fine lines, no rounded rectangles, no pills.
- **No gradients, no shadows, no glows, no emoji, no 3D, no photos, no mascots.**
- **Palette only:**
  - Paper `#FAF8F4`, Card `#FFFFFF`, Ink `#1E1B16`, Hairline `#E4DFD6`
  - Table Blue `#2F5FD0` (action, the table)
  - Ball Orange `#D4680C` (stars only); Court Amber `#FFC266` (a star on the blue)
  - Dark theme: ground `#10141C`, ink `#EDEAE4`, blue `#3F6FE3`, orange `#F5A04A`
- **Two accents rule:** blue means "act or the table", orange means "a star was earned". No third accent hue.
- **Type:** Geist Sans for words, JetBrains Mono for numbers. In logos and banners, **convert all text to outlined paths** so the SVG does not depend on installed fonts.

## Concept directions (pick one, do not mix)

1. **The rotating table.** A flat top-down table in Table Blue with a white centre line and net, seen as a simple rectangle; one Ball Orange star sits on one half. Rotation is hinted by four small squares (the four players) placed on the corners, one rotated a quarter turn.
2. **Four squares, one star.** A 2x2 grid of sharp squares (the four players of a doubles match), three in Ink or Blue, one carrying the orange star. Simple, scales to 16px.
3. **Round and square.** A square frame with a quarter-circle arrow rotating around a star: the "rondo". Only if the rotation stays clearly readable at 32px.

Prefer concept 2 for the icon (legible at 16x16) and concept 1 or 3 for the banner.

## Banner content

- The word **Rondo** set large, with the tagline "Score tracking for friendly playing groups." (smaller, muted).
- One quiet graphic element from the chosen concept on the right. Lots of empty paper space; nothing busy.
- Same layout in light and dark; only colours change.

## Technical requirements

- Plain SVG: `<svg xmlns=... viewBox=...>`, a `<title>` for accessibility, no `width`/`height` fixed in pixels for the icon, no scripts, no external references, no filters.
- Each file under 5 KB.
- The icon must be recognisable at 16x16 and 32x32 (check it), and in one colour (`icon-mono.svg`).
- Contrast: Ink on Paper and white on Table Blue only for text; Ball Orange is for shapes, never for small text.
- Light and dark banners must both be readable on GitHub's light (`#FFFFFF`) and dark (`#0D1117`) page backgrounds.

## Acceptance checklist

- [ ] Square corners everywhere, no gradients or shadows
- [ ] Only the palette above, at most one blue and one orange
- [ ] Text converted to paths
- [ ] Icon readable at 16px, banner readable at 640px wide
- [ ] Files in the locations above, each under 5 KB
- [ ] README placeholder replaced; no other file changed
