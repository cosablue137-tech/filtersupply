# Storefront UI Kit — Filter Supply

A Shopify-style storefront: catalogue → product detail → cart drawer. Same
silent-luxury foundations as the marketing kit.

## Run
Open `index.html` (React + in-browser Babel). Flow:
- **Catalogue** — title, intro, category chips (All / Blends / Single origin /
  Equipment) that filter the grid live, product cards.
- **Product card** → opens the **product detail**: large still, EN + JP name,
  price, tasting notes, spec table, grind selector (coffee only), quantity
  stepper, add-to-cart with live line total, brew ratio.
- **Add to cart** → opens the **cart drawer** (fixed panel, quiet opacity fade —
  no slide). Line items with thumb, qty stepper, remove, free-shipping progress,
  subtotal, checkout. Empty state included.
- Header category nav + cart toggle work from anywhere.

## Components
| File | Exports | Notes |
|------|---------|-------|
| `StoreHeader.jsx` | `StoreHeader` | Header with category nav + cart count. |
| `Catalog.jsx` | `Catalog`, `ProductCard` | Filterable product grid. |
| `ProductDetail.jsx` | `ProductDetail`, `Stepper` | Detail page + quantity stepper. |
| `CartDrawer.jsx` | `CartDrawer` | Slide-over cart with line items + subtotal. |

Reuses `../marketing/Footer.jsx` (`SiteFooter`). Shared foundations:
`../../colors_and_type.css`, `../../assets/icons.jsx`,
`../../ui_kits/products.js`, `../../assets/image-slot.js`,
`../../assets/logo-ink.png`.

## Notes
- Layout classes are `sf-*`; the cart line-item key is `productId|grind` so the
  same bean in two grinds is two lines.
- Product detail stills are drop-in `<image-slot id="sf-…">`; catalogue cards use
  faint kanji placeholders. Swap for `<img>` with real straight-on stills.
- The cart drawer reveals via opacity only (the brand forbids slide-ins).
