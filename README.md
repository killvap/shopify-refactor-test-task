# Shopify Refactor test task – Featured Products Custom section

# Tech stack

- Shopify theme (Dawn 15.4.0 as a base)
- Shopify CLI
- Node.js + npm
- Gulp
- Sass (SCSS → CSS)
- BEM for CSS class naming

---

# Project structure

Key folders/files:

- `sections/featured-products-custom.liquid` – section markup.
- `assets/featured-products-custom.js` – Web Component logic:
  - AJAX request to `cart/add.js`;
  - Section Rendering API;
  - integration with the default Dawn `cart-notification` popup.
- `src/scss/_fonts.scss` – local Gothic A1 font setup (`@font-face`).
- `src/scss/featured-products-custom.scss` – section styles (BEM).
- `assets/featured-products-custom.css` – compiled CSS.
- `gulpfile.js` – SCSS → CSS build pipeline.
- `shopify.theme.toml` – Shopify CLI configuration.

---

# Requirements

Minimal environment:

- Node.js 16+
- npm
- Shopify CLI (v3+)
- Dev store URL: `https://refactor-test-task-2.myshopify.com/`
- Store password: `baidid`

---

# Installation


## clone repository
git clone git@github.com:killvap/shopify-refactor-test-task.git
cd SHOPIFY_TEST_TASK

## install dependencies
npm install


# Development

## 1. Compile SCSS → CSS and start watcher
npx gulp

## 2. Run Shopify dev environment
shopify login --store refactor-test-task-2.myshopify.com
shopify theme dev -e development

## Build before deploy (optional)

npx gulp build
shopify theme push --unpublished
