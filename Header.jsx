/* FILTER SUPPLY — Site header (shared shape across surfaces)
   Slim, fixed, hairline bottom rule. Logo left, nav + icons right.
   No blur, no shadow. */

function SiteHeader({ cartCount = 0, onCart, onNav, active }) {
  const links = [
    { id: "shop", en: "ショップ" },
    { id: "about", en: "私たちについて" },
    { id: "journal", en: "ジャーナル" },
  ];
  return (
    <header className="fs-header">
      <a
        className="fs-header__brand"
        href="#"
        onClick={(e) => { e.preventDefault(); onNav && onNav("home"); }}
      >
        <img src="../../assets/logo-ink.png" alt="Filter Supply" />
      </a>

      <nav className="fs-header__nav">
        {links.map((l) => (
          <a
            key={l.id}
            href="#"
            className={"fs-navlink" + (active === l.id ? " is-active" : "")}
            onClick={(e) => { e.preventDefault(); onNav && onNav(l.id); }}
          >
            {l.en}
          </a>
        ))}
      </nav>

      <div className="fs-header__tools">
        <button className="fs-iconbtn" aria-label="Search">
          <Icon name="search" size={19} />
        </button>
        <button className="fs-iconbtn" aria-label="Cart" onClick={onCart}>
          <Icon name="cart" size={19} />
          <span className="fs-cartcount">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}

if (typeof window !== "undefined") window.SiteHeader = SiteHeader;
