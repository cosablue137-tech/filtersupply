# Filter Supply ダッシュボード

Shopify ストア（`fve1vs-nz.myshopify.com`）の売上と、Instagram（@filter.supply）の
インサイトを、チームの誰もが **Web から確認**できるダッシュボード。Next.js + Vercel。

- **売上タブ**: 総売上 / 注文数 / 平均注文額 / 新規顧客 / 売上推移 / 商品別ランキング / 新規・リピート（60秒ごと自動更新）
- **Instagram タブ**: フォロワー数・純増 / リーチ推移 / 投稿別エンゲージ率 / 形式・曜日・時間帯別 / フォロワー人口統計 / 売上寄与 / 競合ベンチマーク（サーバ側で1時間キャッシュ）
- アクセス: 合い言葉（パスワード）1つで保護

> **売上は直近60日まで。** Shopify の `read_orders` は仕様上60日が上限です。
> それ以前も見たい場合は保護スコープ `read_all_orders` を Shopify に申請してください。
> 流入・転換（セッション/CVR）は Admin API では取得できないため対象外です（GA4 連携が必要）。

---

## 1. Shopify の認証情報を取得（dev dashboard アプリ）

このストアは新しい **dev dashboard**（https://dev.shopify.com）でアプリを管理する方式。
昔の「Admin API トークンを画面表示」機能は無く、**Client ID / Secret から
`client_credentials` grant で24時間トークンを自動取得**する（サーバーが自動更新）。

既存アプリ「**Sales Dashboard**」（client_id `90695548ef4dccc7ac0ad428f65b3d77`）を使用。

1. dev dashboard → Sales Dashboard → **設定 → 資格情報** から
   **Client ID** と **Client secret**（👁で表示）をコピー → `.env.local` に記入
2. スコープは **必須（required）** で `read_orders, read_products, read_customers` を設定済み
   （`sales-dashboard-app/shopify.app.toml` を `shopify app deploy` 済み。
   変更時は dev dashboard の「アプリオートメーショントークン」を作成し
   `SHOPIFY_APP_AUTOMATION_TOKEN=<token> shopify app deploy --allow-updates` で再デプロイ）
3. スコープを変えたら **ストアでアプリを再インストール**して許可を更新すること
   （client_credentials のトークンはインストール時に許可されたスコープを反映するため）

## 2. Instagram のトークンを取る（Instagram タブ用・任意）

Instagram タブは **Instagram Graph API** で自動取得します。本人のトークンが無いと
データは一切返りません。以下を順に用意してください。

### 2-1. アカウント側の前提
1. Instagram を **プロアカウント（ビジネス）** にする（アプリ → 設定 → アカウントの種類とツール）
2. その IG を **Facebook ページ** に連携する（プロアカウント設定内）

### 2-2. Meta アプリとトークン
1. https://developers.facebook.com → **マイアプリ → アプリを作成**（種類「ビジネス」）
2. プロダクトに **Instagram Graph API**（と Facebook ログイン）を追加
3. **グラフ API エクスプローラ** でトークンを発行。付与する権限（スコープ）:
   - `instagram_basic`, `instagram_manage_insights`
   - `pages_show_list`, `pages_read_engagement`, `business_management`
4. **長期トークン化**（60日）か、運用なら Business Manager の
   **システムユーザートークン（無期限）** を推奨。
   - 長期化: `GET /oauth/access_token?grant_type=fb_exchange_token&...`
5. **IG ビジネスアカウントID** を取得:
   - `GET /me/accounts` → 対象ページの `id`
   - `GET /{page-id}?fields=instagram_business_account` → その `id` が `IG_BUSINESS_ACCOUNT_ID`

> 長期ユーザートークンは60日で切れます。切れると Instagram タブに
> 「トークンが無効か期限切れ」と表示されるので、再発行して env を更新してください。
> 継続運用ならシステムユーザートークン（無期限）が楽です。

## 3. 環境変数

`.env.local.example` をコピーして `.env.local` を作り、値を埋める。

```
SHOPIFY_STORE_DOMAIN=fve1vs-nz.myshopify.com
SHOPIFY_CLIENT_ID=90695548ef4dccc7ac0ad428f65b3d77  # 1.の Client ID
SHOPIFY_CLIENT_SECRET=shpss_...         # 1.の Client secret（👁で表示）
DASHBOARD_PASSWORD=チームで共有する合い言葉
DASHBOARD_SESSION_SECRET=ランダムな長い文字列   # openssl rand -hex 32 で生成

# Instagram タブを使う場合のみ
IG_ACCESS_TOKEN=...                     # 2.で取得したトークン
IG_BUSINESS_ACCOUNT_ID=178414xxxxxxxxxx # 2-2.の IG ビジネスアカウントID
IG_COMPETITORS=coffeecountycc           # 競合ユーザー名（@なし・カンマ区切り・任意）
```

> Instagram 系を未設定のまま Instagram タブを開くと、エラー表示になります（売上タブは動きます）。

## 4. ローカルで動かす

```sh
cd dashboard
npm install
npm run dev
```

http://localhost:3000 を開く → 合い言葉を入力 → ダッシュボード表示。
上部タブで「売上 / Instagram」を切り替えます。

## 5. Vercel にデプロイ（公開URL）

1. このリポジトリを Vercel にインポート
2. **Root Directory** を `dashboard` に設定
3. 環境変数（上記）を Vercel の Settings → Environment Variables に登録
4. デプロイ → 発行された URL をチームに共有

> 合い言葉・Admin トークン・IG トークンはサーバー側だけで使われ、ブラウザには出ません。

## Instagram タブの仕様メモ

- Instagram API はレート制限（おおむね 200 call/時）が厳しいため、サーバー側で
  **期間ごとに1時間キャッシュ**します（売上タブのような60秒更新はしません）。
- **フォロワー人口統計**（年齢/性別/都市/国）は **フォロワー100人以上** で取得できます。
- **競合ベンチマーク**は他社の公開「いいね/コメント」のみ比較できます。リーチ・保存・
  インプレッションは API 仕様上、他社分は取得できません。
- **売上寄与**は注文の流入元（`customerJourneySummary`）に instagram を含む注文を
  集計する**簡易アトリビューション**です。完全ではなく、リファラ未計測の分は取りこぼします。
