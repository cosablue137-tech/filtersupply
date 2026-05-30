---
name: filter-supply-design
description: Use this skill to generate well-branded interfaces and assets for Filter Supply — フィルターサプライ, a self-roasted specialty coffee brand from Fukuoka, Japan — either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, logo assets, and UI kit components for prototyping in the brand's "silent luxury / 間 (ma)" aesthetic.
user-invocable: true
---

Read the `README.md` file within this skill first — it covers brand context,
content/voice rules, visual foundations, and iconography. Then explore the other
files:

- `colors_and_type.css` — import this first on any surface. All tokens (warm
  off-white canvas, pure ink, Playfair / Lora / Inter, zero radius, no shadow,
  ma-scale spacing) plus `.fs-*` primitives (buttons, inputs, links, type).
- `assets/` — `logo-ink.png` (for the light canvas), `logo-white.png` (reversed
  on ink), `logo.html` (lockups), `icons.jsx` (hairline UI glyph set),
  `image-slot.js` (drop-in product stills).
- `preview/` — small specimen cards (colors, type, spacing, components, brand).
- `ui_kits/marketing/` and `ui_kits/storefront/` — high-fidelity React component
  recreations. Reusable sections/components for landing pages and the Shopify-style
  store.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy the
assets you need out of this skill and produce static/standalone HTML for the user
to view. If working on production code, copy assets and apply the rules here to
become an expert in designing with this brand.

**Core rules to never break:** warm off-white canvas (#f8f7f5), pure ink (#000),
no accent colors, zero border-radius, no drop-shadows, extreme negative space
(content ≤ ~50% of the surface), the only motion is a subtle opacity fade, JP woven
in as texture (not translation), no emoji, no exclamation, no hype.

If the user invokes this skill without other guidance, ask what they want to build
or design, ask a few focused questions, then act as an expert designer who outputs
HTML artifacts _or_ production code, depending on the need.
