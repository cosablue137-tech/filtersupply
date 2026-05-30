/* FILTER SUPPLY — Storefront header with category nav + cart drawer toggle. */

function StoreHeader({ cartCount = 0, onCart, category, onCategory, onHome }) {
  const cats = [
    { id: "all", en: "すべて" },
    { id: "blend", en: "ブレンド" },
    { id: "single", en: "シングルオリジン" },
    { id: "equipment", en: "器具" },
  ];
  return (
    <header className="fs-header">
      <a className="fs-header__brand" href="#" onClick={(e) => { e.preventDefault(); onHome(); }}>
        <img src="../../assets/logo-ink.png" alt="Filter Supply" />
      </a>
      <nav className="fs-header__nav">
        {cats.map((c) => (
          <a key={c.id} href="#"
             className={"fs-navlink" + (category === c.id ? " is-active" : "")}
             onClick={(e) => { e.preventDefault(); onCategory(c.id); }}>
            {c.en}
          </a>
        ))}
      </nav>
      <div className="fs-header__tools">
        <button className="fs-iconbtn" aria-label="Search"><Icon name="search" size={19} /></button>
        <button className="fs-iconbtn" aria-label="Cart" onClick={onCart}>
          <Icon name="cart" size={19} />
          <span className="fs-cartcount">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}

if (typeof window !== "undefined") window.StoreHeader = StoreHeader;
