/* FILTER SUPPLY — Storefront catalogue: filter row + product grid. JP-primary. */

function ProductCard({ p, onOpen }) {
  return (
    <a className="sf-card" href="#" onClick={(e) => { e.preventDefault(); onOpen(p); }}>
      <div className="sf-card__media">
        <span className="fs-jp sf-card__ghost">{p.kanji}</span>
      </div>
      <div className="sf-card__row">
        <span className="sf-card__name">{p.jp}</span>
        <span className="fs-price">¥{p.price.toLocaleString()}</span>
      </div>
      <div className="sf-card__romaji">{p.en}</div>
      <div className="fs-micro" style={{ marginTop: 8 }}>{p.roast} · {p.weight}</div>
    </a>
  );
}

function Catalog({ products, category, onCategory, onOpen }) {
  const cats = [
    { id: "all", label: "すべて" },
    { id: "blend", label: "ブレンド" },
    { id: "single", label: "シングルオリジン" },
    { id: "equipment", label: "器具" },
  ];
  const list = category === "all" ? products : products.filter((p) => p.cat === category);

  return (
    <main className="sf-catalog">
      <div className="sf-catalog__head">
        <h1 className="fs-display-jp">ショップ</h1>
        <p className="fs-body-jp" style={{ marginTop: 16 }}>
          福岡で焙煎し、その日のうちにお届けします。¥5,000以上で送料無料。
        </p>
      </div>

      <div className="sf-filter">
        <div className="sf-filter__cats">
          {cats.map((c) => (
            <button key={c.id}
              className={"sf-chip" + (category === c.id ? " is-active" : "")}
              onClick={() => onCategory(c.id)}>{c.label}</button>
          ))}
        </div>
        <span className="fs-micro">{list.length} 点</span>
      </div>

      <div className="sf-grid">
        {list.map((p) => <ProductCard key={p.id} p={p} onOpen={onOpen} />)}
      </div>
    </main>
  );
}

Object.assign(window, { ProductCard, Catalog });
