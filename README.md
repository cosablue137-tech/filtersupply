# FILTER SUPPLY — Design System

**フィルターサプライ** · Self-roasted specialty coffee · Fukuoka, Japan (福岡)

---

## 1. Brand context

Filter Supply is a small self-roasting specialty coffee company based in Fukuoka,
Japan. It sells single-origin beans, house blends, and brewing equipment, both
through a marketing site and a Shopify storefront. The brand is built on one idea:
**間 (ma)** — the Japanese aesthetic of negative space. On screen this becomes
*silent luxury*. The interface withdraws so the object — the coffee — is all you
see.

The reference aesthetic is **Graphpaper Tokyo** (graphpaper-tokyo.com): an
extremely restrained, editorial, monochrome surface where typography *is* the
design and emptiness is the primary material. A high-end Tokyo concept store,
printed on screen.

### Surfaces
- **Marketing landing page** — brand story, roast philosophy, featured release.
- **E-commerce storefront** — Shopify-style catalog, product page, cart.

### Design sources
There was **no existing codebase or Figma file** for this brand. The system was
authored from a written brand brief. The guiding external reference is:
- **Graphpaper Tokyo** — https://www.graphpaper-tokyo.com (aesthetic reference only;
  not affiliated; do not copy their assets)

All visual foundations below are original to Filter Supply.

> ⚠️ **Substitutions to confirm** (see CAVEATS at end): web fonts are loaded from
> Google Fonts; product photography uses drop-in image slots (no real photos were
> provided); UI icons use a hairline custom glyph set rather than a branded set.

---

## 2. Content fundamentals — how Filter Supply writes

**Voice:** plain, quiet, matter-of-fact. The brand never sells hard. It states.
A sentence is allowed to be short and then stop. Confidence through restraint.

- **Person:** mostly impersonal / object-first ("Roasted in Fukuoka."). When it
  addresses the reader it uses a soft "you," never "we're so excited."
- **Casing:** Headlines in sentence case or title case set in Playfair — never
  ALL CAPS in display type. ALL CAPS is reserved for *small Inter metadata*
  (labels, eyebrows, nav) where wide letter-spacing makes it feel like a printed
  spec sheet.
- **Punctuation:** minimal. Periods to stop a thought. The interpunct · separates
  metadata (`Ethiopia · Washed · 2025`). En-dashes for ranges.
- **Bilingual JP/EN:** Japanese is *texture, not translation.* A product is
  "Morning Blend / モーニングブレンド". A section may be titled "About / 私たちについて".
  Japanese sits quietly beside English at a smaller size or in `--mute`, never as
  a parenthetical "(this means...)".
- **Emoji:** never. **Exclamation marks:** effectively never.
- **Numerals:** specific and unembellished. "200g", "¥1,800", "Medium roast",
  "Drip · 18g : 270ml · 92°C".

**Examples (house voice):**
> Roasted the day it ships.
> モーニングブレンド。A quiet, balanced cup for the first light.
> Ethiopia, Yirgacheffe. Washed. Notes of bergamot, white peach, black tea.
> Free shipping over ¥5,000.

**Avoid:** marketing superlatives ("best", "amazing", "revolutionary"),
urgency ("Hurry!", "Don't miss out"), emoji, exclamation, hype.

---

## 3. Visual foundations

**Palette — monochrome, warm, no accents.**
- Canvas `#f8f7f5` — warm off-white, *never* pure white. The whole surface sits on this.
- Canvas-deep `#f1efeb` — barely-there alternating fill for the occasional section.
- Card white `#ffffff` — appears in exactly one place: behind a product still, to
  make the object feel lifted off the warm page without a shadow.
- Ink `#000000` — pure black. All text and all UI.
- Mute `#8a857d` — warm gray for metadata, captions, JP texture.
- Lines `rgba(0,0,0,0.12)` hairline / `rgba(0,0,0,0.30)` for active dividers.
- **No accent color exists.** Emphasis is created with scale, weight of *space*,
  and the black/white inversion on buttons — never hue.

**Typography — text is the design.**
- **Playfair Display, weight 400 only** — editorial headlines. Never bold, never
  italic for emphasis (italic is allowed sparingly as editorial texture).
- **Lora** — body prose. Warm, readable, serif.
- **Inter** — metadata, labels, nav, prices. Small, uppercase, wide-tracked.
- Japanese uses a Mincho (serif) system stack to stay in family with Playfair/Lora.
- Generous line-height (1.7 body), tight leading on display (1.08).

**Space — ma.** Content occupies *at most ~50%* of the surface. Page gutters are
huge (`clamp(24px, 6vw, 120px)`). Sections breathe with `144–224px` of vertical
room. White space is the hero element, not a leftover.

**Backgrounds.** Flat warm color only. **No gradients. No textures. No patterns.
No background images** behind text. Imagery is contained, never full-bleed-busy;
when a photo goes full width it is calm and singular.

**Imagery.** Product stills are matter-of-fact: the object sits centered on white
or canvas, shot straight-on, no rotation, no 3D, no perspective, no lifestyle
clutter. Cool-to-neutral, true-to-life color; slightly muted; never over-saturated.
You look at the object; the object does not perform.

**Animation.** Essentially none. The *only* motion is a subtle opacity fade-in on
load (`opacity 0.9s ease`). No slide-ins, no parallax, no bounce, no scroll-jacking.
Hover transitions are slow (0.4s) and limited to a color inversion or a hairline
underline appearing.

**Hover / press states.**
- Links: a hairline underline grows in under the text. No color change.
- Buttons: fill inverts (outline → solid ink, or solid → outline) over 0.4s.
  No scale, no shadow, no glow. Press deepens the fill very slightly.
- Product cards: the only response is the image very slightly settling (opacity),
  plus the title underline. Nothing leaps.

**Borders, radius, shadow.**
- **Border radius: 0.** Everywhere. Buttons, inputs, images, cards. Non-negotiable.
- **Shadows: none.** Ever. Separation comes from hairlines and white space.
- Hairline borders (`1px`, low-opacity black) divide and frame. A product image
  may sit in pure white against the warm canvas — that contrast *is* the frame.

**Cards.** A "card" here is not a rounded shadowed box. It is: a block of white
or canvas, a still image, a hairline rule if needed, and tightly-set type. No
container chrome.

**Transparency & blur.** Avoid blur entirely (no frosted glass — too "tech"). A
fixed header may sit directly on the canvas with a hairline bottom rule, or fade
its background opacity; it does not blur.

**Layout rules.** Asymmetric, editorial grids. Text often pinned to a column at
~34rem measure, floated left or right with the rest of the row left empty on
purpose. A single fixed slim header. Generous, consistent gutters.

---

## 4. Iconography

Filter Supply is near-iconless by philosophy — words and space do the work. The
storefront needs only a tiny set of utilitarian UI glyphs: **search, cart, menu/
close, quantity ±, and a thin directional arrow.**

- These are drawn as **hairline (1px) line glyphs** matching the brand's zero-fill,
  zero-radius, ink-on-canvas language — kept in `assets/icons.jsx` as a shared
  inline-SVG set so every surface uses the identical stroke.
- **No icon font, no emoji, no decorative iconography, no unicode-as-icon.** Where
  a lesser brand would use an icon, Filter Supply uses a word or nothing.
- Quantity steppers use `–` / `+` set in Inter, not circular icon buttons.

> ⚠️ **Substitution flag:** no branded icon set was supplied. The hairline glyphs
> are original and minimal. If you have a house icon set, drop it into `assets/`
> and point `icons.jsx` at it.

---

## 5. Index — what's in this system

| Path | What it is |
|------|------------|
| `README.md` | This file — brand context, voice, foundations, iconography. |
| `colors_and_type.css` | All design tokens: color, type families + scale, spacing, primitives (`.fs-*`). Import this first on any surface. |
| `SKILL.md` | Agent Skills entry point for Claude Code. |
| `assets/` | Logo assets: `logo-ink.png` (light canvas), `logo-white.png` (reversed on ink), `logo.html` (lockups). `icons.jsx` hairline UI glyphs. `image-slot.js` drop-in product stills. |
| `preview/` | Small specimen cards rendered in the Design System tab. |
| `ui_kits/marketing/` | Landing-page UI kit — `index.html` + JSX components. |
| `ui_kits/storefront/` | Shopify-style storefront UI kit — `index.html` + JSX components. **(視覚確認用のHTMLモック)** |
| `ui_kits/products.js` | Shared sample catalogue (`window.FS_PRODUCTS`). |
| `storefront/` | **確認用HTML（Beyond スタイルの実ストア再現）**。`index.html`（ホーム）・`shop.html`（一覧）・`cart.html`（カート）。ネットでの完成度確認・Claude Code デプロイ前の目視用。 |
| `shopify_theme/` | **本番用 Shopify テーマ（Liquid / Online Store 2.0・日本語デフォルト・Beyond スタイル v2）。** 詳細は `shopify_theme/README.md`。 |

**Start here:** import `colors_and_type.css`, read the voice rules in §2, then open
the relevant `ui_kits/*/index.html` for ready-made components.

---

## CAVEATS / things to confirm
1. **Fonts** (Playfair Display, Lora, Inter) load from **Google Fonts CDN**. All
   three are the exact families named in the brief. If you want them self-hosted,
   provide the licensed files and I'll move them into `fonts/`.
2. **Product photography** — none was provided. Surfaces use drop-in image slots /
   neutral placeholders. Replace with real straight-on product stills.
3. **Icons** — original hairline set (substitution flagged above).
4. **Logo** — the user supplied a transparent serif wordmark (high-contrast,
   Playfair-adjacent). It's cropped and stored as `assets/logo-ink.png` (black,
   for the canvas) and `assets/logo-white.png` (reversed, for ink backgrounds).
