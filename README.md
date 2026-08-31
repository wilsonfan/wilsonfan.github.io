# wilson.fan

Jekyll site, built by GitHub Pages directly from `master` &mdash; no CI, no Actions workflow. `css/styles.css`, `js/theme.js`, and `js/email.js` are plain static files, unprocessed by Jekyll. Illustrations live under `images/`.

## Local preview

```
./serve.sh
```

Installs gems on first run (needs Ruby + Bundler), then serves at `http://localhost:4000` with live rebuild on save. Stop with Ctrl-C.

## Accessibility check

```
npx pa11y --standard WCAG2AA <url>
npx pa11y --runner axe <url>
```

Run ad-hoc against pages you've touched (or the live site) when it seems worth checking &mdash; not required after every change. `pa11y` isn't a project dependency; `npx` fetches it on demand and leaves no `package.json`/`node_modules` behind.

## Adding a recipe

Recipes are documents in the `_recipes` collection, output at `/<filename>.html` (same flat URL scheme as before). Add a new file there and it appears automatically wherever `site.recipes` is looped over.

### 1. File name

`_recipes/sous-vide-<dish>.html` (kebab-case, lowercase). Not sous vide? Drop that prefix but keep kebab-case, e.g. `_recipes/roast-chicken.html`.

### 2. Front matter

```yaml
---
title: "<Dish Name>"
description: "<one-sentence meta description>"
meta: "<one-line summary shown under the h1: temp/time, or prep/cook/serves>"
order: 7
hub_blurb: "<one-sentence hook shown on the recipes.html row>"
---
```

- `order` controls position in the `recipes.html` list &mdash; give it the next integer.
- `layout: recipe` and `nav: recipes` are set automatically via `_config.yml` collection defaults; don't repeat them.
- A working-notes/reference page (see `sous-vide-reference.html` for the pattern) uses `lede` instead of `meta`, and can add `tag: "Reference"` to show a small label on its hub row.

### 3. Recipe body

Everything after the front matter is raw HTML (no Markdown conversion happens on `.html` files), wrapped in `<div class="recipe-body">...</div>`:

- `<div class="recipe-intro">` pairs the illustration with `<h2>Ingredients</h2>` + `<ul>`. Multiple components (sauce, garnish, etc.) get a `<p><strong>Component name</strong></p>` before their own `<ul>`.
- `<h2>Steps</h2>` (or a more specific heading like `<h2>Poach the pears</h2>` if the recipe has multiple stages) + `<ol>`.
- Optional `<p class="recipe-note">...</p>` for a callout worth highlighting (a tip, a warning, a substitution).
- If adapted from somewhere, close with `<p class="recipe-source">Source: <a href="..." target="_blank" rel="noopener">...</a></p>` **outside** the closing `</div>` of `.recipe-body`.

### 4. Optional: line-drawing illustration

Recipe pages can carry a `.recipe-art` illustration inside `.recipe-intro`, matching `images/wilson_burger.png`'s black ink line-drawing style (no color, no shading, no fill).

- Generate with a `gemini-2.5-flash-image` (Nano Banana) call, passing `images/wilson_burger.png` as the style-reference image alongside a prompt describing the dish. See git history for the exact prompt template used.
- Save as `images/<dish-name>.png` (same basename as the collection file) with a transparent background &mdash; flood the near-white pixels to alpha 0 so dark mode can invert it cleanly (white lines on the dark page background instead of a visible white box).
- Generate a lossless `.webp` alongside it (`cwebp -lossless -z 9 -q 80`) and serve both via `<picture>`, same pattern as the homepage hero:

```html
<div class="recipe-art">
  <picture>
    <source srcset="/images/<dish-name>.webp" type="image/webp">
    <img src="/images/<dish-name>.png" alt="Line drawing of <dish>" width="1056" height="992">
  </picture>
</div>
```

Every recipe currently has one, and the `recipes.html`/`notes.html` hub loops assume `images/<slug>.png`/`.webp` exist. If a future recipe skips the illustration, add an `{% if %}` around the hub-row `<picture>` (falling back to an empty `<div class="item-list-thumb"></div>`) rather than forcing a mediocre image.

### 5. Reference / working-notes pages

Not every page is a finished recipe &mdash; `sous-vide-reference.html` is a running table of time/temp trials by protein. Use `.ref-section`, `.table-wrap` + `.ref-table` for that shape instead of the ingredients/steps pattern. Keep raw trial notes (including "too raw", "try X next") rather than smoothing them into a single answer &mdash; the comparisons are the point. `.table-wrap` can overflow horizontally on narrow screens, so give it `tabindex="0"` (keyboard users need to be able to focus it to scroll).

## Adding a note

Notes are documents in the `_notes` collection, following the same idea as recipes:

```yaml
---
title: "<Note Title>"
description: "<one-sentence meta description>"
lede: "<one or two sentence summary, shown as the section lede>"
updated: 2026-08-30
order: 5
thumb_alt: "<alt text for the illustration>"
hub_blurb: "<one-sentence hook shown on the notes.html row>"
intro: "<opening paragraph, shown beside the illustration>"
---
  <h2>First section</h2>
  ...
```

- `layout: note` and `nav: notes` come from `_config.yml` collection defaults.
- The `note` layout renders the illustration beside the `intro` paragraph (same `.recipe-intro` pairing recipes use) and the "Last updated" line automatically from `thumb_alt`/`updated`/`intro` &mdash; don't repeat any of them in the body, and don't add your own `.note-body` wrapper, the layout provides it.
- Body content starts at the first `<h2>` &mdash; the opening paragraph lives in `intro` instead.
- Bump `updated` (and keep it an actual `YYYY-MM-DD` value, quotes optional) whenever a note gets a substantive edit.
- A copy-paste command, config snippet, or prompt goes in `<pre class="prompt-block" tabindex="0"><code>...</code></pre>` &mdash; the `tabindex` lets keyboard users focus and scroll it when a long line overflows.

## Theme toggle

Every page follows system `prefers-color-scheme` by default, with a manual override via a `data-theme="light"`/`"dark"` attribute on `<html>`, set by clicking the split-circle icon button in the nav (`theme.js`) and persisted in `localStorage`. This all lives in `_layouts/default.html` &mdash; new pages get it for free via `layout: default` (or `recipe`/`note`, which both extend it). The three pieces, if you ever need to touch them:

1. The anti-flash inline `<script>` right after the `color-scheme` meta tag in `<head>` &mdash; applies a saved theme before first paint.
2. The icon button as the last item inside `<nav>`.
3. `<script src="js/theme.js"></script>` next to the `js/email.js` tag at the bottom of `<body>`.

Anything that needs to invert between themes (line-drawing illustrations so far) should use `filter: invert(var(--invert))` rather than its own `prefers-color-scheme` media query, so it respects the manual override too.

## Analytics

Cloudflare Web Analytics beacon is baked into `_layouts/default.html`, right before `</body>`, so every page gets it automatically. Cookie-free, no consent banner needed. Doesn't require the domain's DNS to be on Cloudflare.

## Style tokens

Colors, spacing, and component classes (`.recipe-body`, `.note-body`, `.ref-table`, etc.) all live in `css/styles.css`. Don't hardcode colors or one-off styles in a page &mdash; add a class to `css/styles.css` using the existing `--bg` / `--text` / `--text-muted` / `--accent` / `--border` custom properties so light and dark mode both stay correct.

Headlines (`.hero h1`, `.page-section h1`, `.wordmark`) use a self-hosted display serif (`--font-display`, Fraunces) instead of the system font stack &mdash; the two `.woff2` files live in `fonts/`. Body text, nav, and recipe/note content stay on the system stack for load speed; only large headline-scale text gets the display face.

The homepage hero also carries a `.hero-cta` &mdash; a specific "start here" link, not generic nav.
