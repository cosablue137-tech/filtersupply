/* FILTER SUPPLY — Site footer. Bilingual, hairline, generous. */

function SiteFooter() {
  const cols = [
    {
      head: "ショップ",
      items: ["ブレンド", "シングルオリジン", "器具", "ギフトセット", "定期便"],
    },
    {
      head: "私たちについて",
      items: ["焼煎所", "福岡の店", "淹れ方ガイド", "ジャーナル"],
    },
    {
      head: "サポート",
      items: ["配送について", "返品・交換", "卸し・業務用", "お問い合わせ"],
    },
  ];
  return (
    <footer className="fs-footer">
      <div className="fs-footer__top">
        <div className="fs-footer__brand">
          <img src="../../assets/logo-ink.png" alt="Filter Supply" />
          <p className="fs-body-jp" style={{ marginTop: 18, fontSize: 14, lineHeight: 1.9 }}>
            福岡で自家焙煎する、<br />スペシャルティコーヒー。
          </p>
          <p className="fs-romaji" style={{ marginTop: 10 }}>
            Self-roasted specialty coffee · Fukuoka
          </p>
        </div>
        <div className="fs-footer__cols">
          {cols.map((c) => (
            <div key={c.head} className="fs-footer__col">
              <div className="fs-footer__head">{c.head}</div>
              <ul>
                {c.items.map((i) => (
                  <li key={i}><a className="fs-link" href="#" onClick={(e) => e.preventDefault()}>{i}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="fs-footer__base">
        <span className="fs-micro">© 2026 Filter Supply · 福岡市</span>
        <span className="fs-micro">Instagram · ニュースレター · プライバシー</span>
      </div>
    </footer>
  );
}

if (typeof window !== "undefined") window.SiteFooter = SiteFooter;
