/* FILTER SUPPLY — Marketing landing page sections. Japanese-primary. */
const { useState } = React;

/* — A product still: user-fillable image slot, framed on white — */
function Still({ id, kanji, ratio = "4 / 5" }) {
  return (
    <div className="mk-still" style={{ aspectRatio: ratio }}>
      <image-slot
        id={id}
        class="mk-slot"
        shape="rect"
        fit="cover"
        placeholder={"写真をドロップ · " + kanji}
      ></image-slot>
    </div>
  );
}

/* — Hero — */
function Hero({ onShop }) {
  return (
    <section className="mk-hero">
      <div className="mk-hero__text">
        <div className="fs-eyebrow">福岡 · 自家焙煎</div>
        <h1 className="fs-hero-jp" style={{ marginTop: 28 }}>
          焙煎したその日に、<br />お届けする。
        </h1>
        <p className="fs-romaji" style={{ marginTop: 22 }}>Roasted the day it ships</p>
        <p className="fs-body-jp" style={{ marginTop: 26 }}>
          福岡の小さな焙煎所です。シングルオリジンとブレンドを、少量ずつ焙煎し、
          その日のうちにお届けします。急がない。一杯は、ととのったときに届きます。
        </p>
        <div style={{ marginTop: 40, display: "flex", gap: 14 }}>
          <button className="fs-btn fs-btn--solid" onClick={onShop}>コーヒーを見る</button>
          <button className="fs-btn">焙煎所について</button>
        </div>
      </div>
      <div className="mk-hero__media">
        <Still id="mk-hero-still" kanji="珈琲" ratio="3 / 4" />
      </div>
    </section>
  );
}

/* — Manifesto (ma) — */
function Manifesto() {
  return (
    <section className="mk-manifesto">
      <span className="mk-ma fs-jp" aria-hidden="true">間</span>
      <div className="mk-manifesto__body">
        <div className="fs-eyebrow">私たちの考え</div>
        <h2 className="fs-display-jp" style={{ marginTop: 24 }}>
          一杯のまわりにある余白も、<br />一杯と同じだけ大切にする。
        </h2>
        <p className="fs-body-jp" style={{ marginTop: 24 }}>
          少しだけ焙煎し、少しだけ売り、あとはあえて空けておく。産地をしぼり、
          目の届く範囲で。香りが落ちる前に飲みきれる量を。これは、静かなコーヒーです。
        </p>
      </div>
    </section>
  );
}

/* — Featured release — */
function Featured({ product, onView }) {
  return (
    <section className="mk-featured">
      <div className="mk-featured__media">
        <Still id="mk-featured-still" kanji={product.kanji} ratio="1 / 1" />
      </div>
      <div className="mk-featured__text">
        <div className="fs-eyebrow">新着</div>
        <h2 className="fs-display-jp" style={{ marginTop: 22 }}>{product.jp}</h2>
        <p className="fs-romaji" style={{ marginTop: 12 }}>{product.en}</p>
        <p className="fs-body-jp" style={{ marginTop: 22 }}>{product.notes}</p>
        <div className="mk-spec">
          <span>{product.origin}</span><i>·</i>
          <span>{product.process}</span><i>·</i>
          <span>{product.roast}</span>
        </div>
        <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 28 }}>
          <span className="fs-price" style={{ fontSize: 18 }}>¥{product.price.toLocaleString()}</span>
          <button className="fs-btn" onClick={() => onView(product)}>詳しく見る →</button>
        </div>
      </div>
    </section>
  );
}

/* — A simple marketing product card — */
function MiniCard({ p, onView }) {
  return (
    <a className="mk-card" href="#" onClick={(e) => { e.preventDefault(); onView(p); }}>
      <div className="mk-card__media">
        <span className="fs-jp mk-card__ghost">{p.kanji}</span>
      </div>
      <div className="mk-card__row">
        <span className="mk-card__name">{p.jp}</span>
        <span className="fs-price">¥{p.price.toLocaleString()}</span>
      </div>
      <div className="fs-micro" style={{ marginTop: 6 }}>{p.roast} · {p.weight}</div>
    </a>
  );
}

/* — Product row — */
function ProductRow({ products, onView, onShop }) {
  return (
    <section className="mk-row">
      <div className="mk-row__head">
        <h2 className="fs-h1-jp" style={{ whiteSpace: "nowrap" }}>ショップ</h2>
        <button className="fs-link fs-meta" onClick={onShop}>すべて見る →</button>
      </div>
      <div className="mk-grid">
        {products.map((p) => <MiniCard key={p.id} p={p} onView={onView} />)}
      </div>
    </section>
  );
}

/* — Newsletter — */
function Newsletter() {
  const [sent, setSent] = useState(false);
  return (
    <section className="mk-news">
      <div className="fs-eyebrow">お便り</div>
      <h2 className="fs-display-jp" style={{ marginTop: 20, maxWidth: "22ch" }}>
        新しい焙煎のお知らせを、<br />月に一度だけ。
      </h2>
      <form
        className="mk-news__form"
        onSubmit={(e) => { e.preventDefault(); setSent(true); }}
      >
        <input className="fs-input" type="email" required placeholder="メールアドレス" disabled={sent} />
        <button className="fs-btn fs-btn--solid" type="submit">{sent ? "ありがとうございます" : "登録する"}</button>
      </form>
    </section>
  );
}

Object.assign(window, { Still, Hero, Manifesto, Featured, MiniCard, ProductRow, Newsletter });
