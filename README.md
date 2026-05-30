# Filter Supply — Shopify テーマ（v2 / Beyond スタイル）

クリーンでミニマルな e-commerce デザイン。白地・墨色・クリームのフッター・チャコールの
特集セクション。ライトなセリフ見出し（Cormorant Garamond）＋ワイドトラッキングの
サンス（Jost）。**Online Store 2.0** 準拠、**日本語デフォルト**ロケール。

> 📌 Liquid テーマのため**この制作環境では描画できません**。見た目は同梱の確認用HTML
> （`storefront/index.html`・`shop.html`・`cart.html`）で確認してください。本テーマは
> Shopify にアップロード、または Claude Code でデプロイして確認します。

---

## 1. 導入

### ZIP アップロード
1. `shopify_theme/` の**中身**を ZIP 圧縮（`layout/` `templates/` `sections/` … が ZIP 直下に来るように）。
2. 管理画面 → オンラインストア → テーマ → **テーマを追加 → ZIPをアップロード**。
3. **公開／プレビュー**。

### Shopify CLI（Claude Code でのデプロイ向け）
```bash
cd shopify_theme
shopify theme dev      # ローカルプレビュー（実データで描画確認）
shopify theme push     # ストアへ反映
```

---

## 2. 初回セットアップ

### 商品メタフィールド（任意・未設定でも崩れません）
**設定 → メタフィールド → 商品** に「1行テキスト」で追加：

| キー | 用途 | 例 |
|---|---|---|
| `custom.notes` | テイスティングノート（商品名の下／カード） | `Floral · Bergamot · Clean` |
| `custom.tag` | カードのタグ（左上） | `Single Origin` / `Limited` |
| `custom.kanji` | 画像が無い時の代替漢字 | `花` |
| `custom.origin` | 原産地（商品ページ） | `Ethiopia` |
| `custom.process` | 精製 | `Washed` |
| `custom.roast` | 焙煎度 | `Light` |
| `custom.weight` | 内容量 | `200g` |
| `custom.brew` | 抽出メモ | `18g : 270ml · 92°C · 2:45` |

### メニュー
**オンラインストア → メニュー** で `main-menu`（Home / Shop / About / Journal）と
`footer` を作成。ヘッダー／フッターのセクション設定から割り当てます。

### ホームの組み立て
テーマエディタの**ホームページ**で各セクションを追加・並べ替え：
ヒーロー → 商品グリッド（Best Sellers）→ ダーク特集 → ブランドバンド → 画像の行 →
商品グリッド（Seasonal）→ ジャーナル → フルブリードCTA → ニュースレター。
各「商品グリッド」セクションに**コレクション**を割り当ててください。

### 画像
ヒーロー・特集・CTA・画像の行・コレクションヘッダーは各セクション設定で画像を指定。
商品写真は商品に登録（白背景の正面ストィル推奨）。

---

## 3. ファイル構成

```
shopify_theme/
├─ layout/theme.liquid
├─ templates/
│  ├─ index.json              ホーム（セクション順）
│  ├─ collection.json → main-collection（Shop All：ヒーロー＋フィルタバー＋グリッド＋プロモタイル）
│  ├─ product.json → main-product（ギャラリー＋情報＋アコーディオン）
│  ├─ cart.liquid             カート（テーブル：PRICE / QUANTITY / TOTAL ＋ ノート）
│  ├─ page.liquid  search.liquid  list-collections.liquid  404.liquid
├─ sections/
│  ├─ announcement / header / footer
│  ├─ hero / featured-collection / dark-feature / brand-band
│  ├─ image-row / blog-posts / fullbleed-cta / newsletter
│  └─ main-collection / main-product
├─ snippets/ product-card.liquid · icon.liquid
├─ assets/ base.css · theme.js · logo-ink.png · logo-white.png
├─ config/ settings_schema.json · settings_data.json
└─ locales/ ja.default.json · en.json
```

---

## 4. 仕組み

- **カートはページ式**（ドロワー無し。参照デザインに合わせています）。商品カードの「＋」と
  商品ページの「カートに入れる」は**ネイティブのフォーム送信**で `/cart` に追加 → カートページへ。
  JS に依存しないため確実に動きます。
- カートページの数量増減・削除は Shopify の `change`/`remove` リンクを使用。
- 商品ページのバリエーション選択と数量ステッパーのみ `theme.js`。
- 配色・書体は固定（テーマ設定で変更不可）。ブランド一貫性のため意図的。

## 5. 注意

1. **描画はこの環境では不可**（Liquid）。確認用HTML または Shopify/CLI で確認してください。
2. メタフィールド未設定でもレイアウトは崩れません（該当行が消えるだけ）。
3. チェックアウトは Shopify 標準へ遷移。配送・税は管理画面側の設定に従います。
4. フォント（Cormorant Garamond / Jost / Noto Serif JP）は Google Fonts から読込。
