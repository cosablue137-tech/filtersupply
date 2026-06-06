#!/bin/sh
# Filter Supply 売上ダッシュボードをローカルで起動する
# 使い方:  sh /Users/user/filtersupply/dashboard-dev.sh
set -e
cd /Users/user/filtersupply/dashboard

# .env.local が無ければ雛形からコピー（初回のみ）
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  echo "----------------------------------------------------------------"
  echo ".env.local を作成しました。次の値を埋めてから、もう一度このスクリプトを実行してください:"
  echo "  - SHOPIFY_ADMIN_TOKEN   （Shopify Custom App の shpat_... トークン）"
  echo "  - DASHBOARD_PASSWORD    （チームで共有する合い言葉）"
  echo "  - DASHBOARD_SESSION_SECRET （ランダムな長い文字列）"
  echo ""
  echo "ファイル: /Users/user/filtersupply/dashboard/.env.local"
  echo "----------------------------------------------------------------"
  exit 0
fi

# 依存関係が未インストールなら入れる
if [ ! -d node_modules ]; then
  echo "依存パッケージをインストール中…"
  npm install
fi

echo "ダッシュボードを起動します → http://localhost:3000"
npm run dev
