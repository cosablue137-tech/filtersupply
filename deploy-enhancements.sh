#!/bin/sh
# Filter Supply — EC強化機能をライブテーマへ反映するスクリプト
# 使い方:  sh /Users/user/filtersupply/deploy-enhancements.sh
set -e
cd /Users/user/filtersupply

shopify theme push \
  --store fve1vs-nz \
  --theme 157995335865 \
  --path shopify_theme \
  --allow-live \
  --only sections/footer.liquid \
  --only sections/featured-product.liquid \
  --only sections/featured-collection.liquid \
  --only sections/value-props.liquid \
  --only sections/brew-guide.liquid \
  --only sections/main-product.liquid \
  --only templates/cart.liquid \
  --only snippets/icon.liquid \
  --only snippets/product-card.liquid \
  --only assets/base.css \
  --only assets/theme.js \
  --only locales/ja.default.json \
  --only locales/en.json
