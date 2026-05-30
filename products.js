/* Filter Supply — sample coffee catalogue (preview only).
   Reflects the brand: hand-drip black coffee, light → dark,
   single origins incl. their Aceh (Sumatra) direct trade & Panama. */
window.FS_PRODUCTS = [
  { id: "ethiopia",  name: "Ethiopia — Washed",       notes: "Floral · Bergamot · Clean",     price: 2160, tag: "Light",        kanji: "花" },
  { id: "aceh",      name: "Indonesia — Aceh",         notes: "Herbal · Brown Sugar · Deep",   price: 2376, tag: "Direct Trade", kanji: "森" },
  { id: "panama",    name: "Panama — Traditional",     notes: "Honey · Stone Fruit · Round",   price: 2700, tag: "Limited",      kanji: "実" },
  { id: "guatemala", name: "Guatemala — Antigua",      notes: "Cocoa · Apple · Caramel",       price: 1980, tag: "",             kanji: "豆" },
  { id: "house",     name: "House Blend",              notes: "Chocolate · Almond · Balanced", price: 1620, tag: "Best Seller",  kanji: "朝" },
  { id: "dark",      name: "Dark Blend",               notes: "Bitter Cocoa · Fig · Bold",     price: 1728, tag: "Dark",         kanji: "夜" },
  { id: "kenya",     name: "Kenya — Nyeri",            notes: "Blackcurrant · Bright",         price: 2376, tag: "",             kanji: "赤" },
  { id: "decaf",     name: "Decaf — Colombia",         notes: "Caramel · Smooth",              price: 1728, tag: "Decaf",        kanji: "静" },
  { id: "dripbag",   name: "Drip Bag Set ×10",         notes: "Assorted · Gift",               price: 1944, tag: "",             kanji: "袋" },
];

window.FS_FMT = function (yen) { return "¥" + yen.toLocaleString("ja-JP"); };
