/* FILTER SUPPLY — Cart drawer. Fixed panel, quiet opacity fade (no slide). */

function CartDrawer({ open, items, products, onClose, onQty, onRemove }) {
  const byId = (id) => products.find((p) => p.id === id);
  const lines = items.map((it) => ({ ...it, p: byId(it.id) })).filter((l) => l.p);
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const FREE = 5000;
  const remaining = Math.max(0, FREE - subtotal);
  const grindLabel = { whole: "豆のまま", drip: "中細挪き", espresso: "極細挪き" };

  return (
    <div className={"sf-cart" + (open ? " is-open" : "")} aria-hidden={!open}>
      <div className="sf-cart__scrim" onClick={onClose}></div>
      <aside className="sf-cart__panel" role="dialog" aria-label="カート">
        <div className="sf-cart__head">
          <span className="fs-eyebrow">カート</span>
          <button className="fs-iconbtn" aria-label="閉じる" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>

        {lines.length === 0 ? (
          <div className="sf-cart__empty">
            <p className="fs-h2-jp">カートは空です。</p>
            <p className="fs-romaji" style={{ marginTop: 12 }}>Your cart is empty</p>
          </div>
        ) : (
          <React.Fragment>
            <div className="sf-cart__lines">
              {lines.map((l) => (
                <div className="sf-line" key={l.key}>
                  <div className="sf-line__thumb"><span className="fs-jp">{l.p.kanji}</span></div>
                  <div className="sf-line__body">
                    <div className="sf-line__top">
                      <span className="sf-line__name">{l.p.jp}</span>
                      <span className="fs-price">¥{(l.p.price * l.qty).toLocaleString()}</span>
                    </div>
                    <div className="fs-micro" style={{ color: "var(--mute)", marginTop: 4 }}>
                      {l.grind ? grindLabel[l.grind] + " · " : ""}{l.p.weight}
                    </div>
                    <div className="sf-line__foot">
                      <div className="sf-stepper sf-stepper--sm">
                        <button onClick={() => onQty(l.key, Math.max(1, l.qty - 1))}><Icon name="minus" size={13} /></button>
                        <span className="sf-stepper__val">{l.qty}</span>
                        <button onClick={() => onQty(l.key, l.qty + 1)}><Icon name="plus" size={13} /></button>
                      </div>
                      <button className="sf-line__remove fs-micro" onClick={() => onRemove(l.key)}>削除</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sf-cart__foot">
              <div className="sf-cart__ship fs-micro">
                {remaining > 0
                  ? "送料無料まで ¥" + remaining.toLocaleString()
                  : "送料無料でお届けします"}
              </div>
              <div className="sf-cart__subtotal">
                <span className="fs-meta">小計</span>
                <span className="fs-price" style={{ fontSize: 17 }}>¥{subtotal.toLocaleString()}</span>
              </div>
              <button className="fs-btn fs-btn--solid" style={{ width: "100%" }}>レジへ進む</button>
              <p className="fs-micro" style={{ color: "var(--mute)", textAlign: "center", marginTop: 14 }}>
                税・送料はレジで計算されます
              </p>
            </div>
          </React.Fragment>
        )}
      </aside>
    </div>
  );
}

if (typeof window !== "undefined") window.CartDrawer = CartDrawer;
