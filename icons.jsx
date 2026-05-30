/* ============================================================
   FILTER SUPPLY — Hairline UI glyphs
   Original, minimal, 1px stroke. Zero fill. Match ink-on-canvas.
   Shared across every surface so the stroke is identical.

   Usage (React, via Babel):
     <Icon name="cart" size={20} />
   Exports Icon + the raw set to window.
   ============================================================ */

function Icon({ name, size = 20, stroke = 1, color = "currentColor", style }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "square",   // squared ends — matches zero-radius language
    strokeLinejoin: "miter",
    style,
    "aria-hidden": true,
  };
  const paths = {
    // straight-on shopping bag, hairline
    cart: (
      <>
        <path d="M5 7 H19 L18 21 H6 Z" />
        <path d="M9 7 V5.5 A3 3 0 0 1 15 5.5 V7" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <line x1="15.5" y1="15.5" x2="21" y2="21" />
      </>
    ),
    menu: (
      <>
        <line x1="3" y1="8" x2="21" y2="8" />
        <line x1="3" y1="16" x2="21" y2="16" />
      </>
    ),
    close: (
      <>
        <line x1="5" y1="5" x2="19" y2="19" />
        <line x1="19" y1="5" x2="5" y2="19" />
      </>
    ),
    plus: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    ),
    minus: <line x1="5" y1="12" x2="19" y2="12" />,
    arrow: (
      <>
        <line x1="4" y1="12" x2="20" y2="12" />
        <polyline points="14,6 20,12 14,18" />
      </>
    ),
    "arrow-down": (
      <>
        <line x1="12" y1="4" x2="12" y2="20" />
        <polyline points="6,14 12,20 18,14" />
      </>
    ),
    account: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21 a8 8 0 0 1 16 0" />
      </>
    ),
  };
  return <svg {...common}>{paths[name] || null}</svg>;
}

if (typeof window !== "undefined") {
  window.Icon = Icon;
}
