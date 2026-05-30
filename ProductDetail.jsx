/* FILTER SUPPLY — Product detail. Large still + spec column. JP-primary. */
const { useState: useStateP } = React;

function Stepper({ value, onChange }) {
  return (
    <div className="sf-stepper">
      <button aria-label="数を減らす" onClick={() => onChange(Math.max(1, value - 1))}><Icon name="minus" size={15} /></button>
      <span className="sf-stepper__val">{value}</span>
      <button aria-label="数を増やす" onClick={() => onChange(value + 1)}><Icon name="plus" size={15} /></button>
    </div>
  );
}

function ProductDetail({ product, onBack, onAdd }) {
  const [qty, setQty] = useStateP(1);
  const [grind, setGrind] = useStateP("whole");
  const grinds = [
    { id: "whole", label: "豆のまま" },
    { id: "drip", label: "中細挽き" },
    { id: "espresso", label: "極細挽き" },
  ];
  const isCoffee = product.cat !== "equipment";

  return (
    <main className="sf-detail">
      <button className="sf-back fs-meta" onClick={onBack}>← ショップへ戻る</button>
      <div className="sf-detail__grid">
        <div className="sf-detail__media">
          <div className="mk-still" style={{ aspectRatio: "1 / 1", maxWidth: "none" }}>
            <image-slot id={"sf-" + product.id} class="mk-slot" shape="rect" fit="cover"
              placeholder={"写真をドロップ · " + product.kanji}></image-slot>
          </div>
        </div>

        <div className="sf-detail__info">
          <div className="fs-eyebrow">{product.origin} · 自家焙煎</div>
          <h1 className="fs-display-jp" style={{ marginTop: 18 }}>{product.jp}</h1>
          <p className="fs-romaji" style={{ marginTop: 12 }}>{product.en}</p>
          <p className="fs-price" style={{ fontSize: 20, marginTop: 26 }}>¥{product.price.toLocaleString()}</p>

          <p className="fs-body-jp" style={{ marginTop: 26 }}>{product.notes}</p>

          <dl className="sf-spec">
            {isCoffee && <><dt>原産地</dt><dd>{product.origin}</dd></>}
            <dt>精製</dt><dd>{product.process}</dd>
            {isCoffee && <><dt>焙煎度</dt><dd>{product.roast}</dd></>}
            <dt>{isCoffee ? "内容量" : "サイズ"}</dt><dd>{product.weight}</dd>
          </dl>

          {isCoffee && (
            <div className="sf-grind">
              <div className="fs-micro" style={{ marginBottom: 12 }}>挽き方</div>
              <div className="sf-grind__opts">
                {grinds.map((g) => (
                  <button key={g.id}
                    className={"sf-chip" + (grind === g.id ? " is-active" : "")}
                    onClick={() => setGrind(g.id)}>{g.label}</button>
                ))}
              </div>
            </div>
          )}

          <div className="sf-buy">
            <Stepper value={qty} onChange={setQty} />
            <button className="fs-btn fs-btn--solid" style={{ flex: 1 }}
              onClick={() => onAdd(product, qty, isCoffee ? grind : null)}>
              カートに入れる — ¥{(product.price * qty).toLocaleString()}
            </button>
          </div>

          {isCoffee && (
            <p className="fs-micro" style={{ marginTop: 26, color: "var(--mute)", lineHeight: 1.7 }}>
              抽出 · 18g : 270ml · 92°C · 2:45
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

Object.assign(window, { Stepper, ProductDetail });
