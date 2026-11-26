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
date: 2026-08-30
last_modified_at: 2026-08-30
image: /images/social/<dish-name>.jpg
---
```

- `date` is when the page was first published, `last_modified_at` the last substantive edit (both `YYYY-MM-DD`). They feed the sitemap `lastmod` and the structured data (see SEO below); bump `last_modified_at` on real content changes, not on markup tweaks.
- `image` is the share preview (see SEO below).
- Optional, for Google's recipe rich results: `recipe_yield` (`"4 servings"`), `prep_time` / `cook_time` / `total_time` (ISO 8601 durations: `PT15M`, `PT1H`, `PT16H40M`), `recipe_category` (`Main course`, `Sauce`, `Dessert`), `recipe_cuisine`. Only fill in what the recipe actually states; leave a field out rather than guess.

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

- Generate with a `gemini-2.5-flash-image` (Nano Banana) call to `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent` (key in the `x-goog-api-key` header, from `GEMINI_API_KEY`; `generationConfig.responseModalities: ["IMAGE"]`), passing a style-reference image as `inline_data` alongside the prompt. Use `images/wilson_burger.png` for recipes; for notes, an existing note image (e.g. `images/bambu-lab-nfc-cloning.png`) gives the simpler, smaller-subject look the notes share. Prompt used for the Akahu note (swap the subject):

  > Using the attached image as the exact style reference, draw a new illustration in the same style: minimal black ink line drawing, uniform thin outline strokes, no color, no shading, no fill, no text, white background, plenty of empty space around a small centered subject. Subject: &lt;what to draw&gt;.

  The earlier prompts weren't kept, so save new ones here. `400 API_KEY_INVALID` means the key is expired or revoked; make a new one in Google AI Studio.
- Save as `images/<dish-name>.png` (same basename as the collection file), 1056&times;992, with a transparent background &mdash; flood the near-white pixels to alpha 0 so dark mode can invert it cleanly (white lines on the dark page background instead of a visible white box). Gemini leaves a faint grey haze around the drawing, so threshold rather than only removing pure white: with Pillow, convert to greyscale, set alpha 0 where the value is over ~235 and scale alpha by darkness below that, colour black. Check the result composited on white before committing.
- Generate a lossless `.webp` alongside it (`cwebp -lossless -z 9 -q 80`) and serve both via `<picture>`, same pattern as the homepage hero:

```html
<div class="recipe-art">
  <picture>
    <source srcset="/images/<dish-name>.webp" type="image/webp">
    <img src="/images/<dish-name>.png" alt="Line drawing of <dish>" width="1056" height="992">
  </picture>
</div>
```

Every recipe currently has one, and the `recipes.html`/`notes.html` hub loops assume `images/<slug>.png`/`.webp` exist. If a future recipe skips the illustration, add an `{% if %}` around the hub-row `<picture>` (falling back to an empty `<div class="item-list-thumb"></div>`) rather than forcing a mediocre image. Notes already do this: leave out `thumb_alt` and both `notes.html` and the `note` layout skip the image (the intro then renders as a plain paragraph).

### 5. Reference / working-notes pages

Not every page is a finished recipe &mdash; `sous-vide-reference.html` is a running table of time/temp trials by protein. Use `.ref-section`, `.table-wrap` + `.ref-table` for that shape instead of the ingredients/steps pattern. Keep raw trial notes (including "too raw", "try X next") rather than smoothing them into a single answer &mdash; the comparisons are the point. `.table-wrap` can overflow horizontally on narrow screens, so give it `tabindex="0"` (keyboard users need to be able to focus it to scroll).

## Adding a note

Notes are documents in the `_notes` collection, following the same idea as recipes:

```yaml
---
title: "<Note Title>"
description: "<one-sentence meta description>"
lede: "<one or two sentence summary, shown as the section lede>"
date: 2026-08-30
last_modified_at: 2026-08-30
order: 5
thumb_alt: "<alt text for the illustration>"
image: /images/social/<slug>.jpg
hub_blurb: "<one-sentence hook shown on the notes.html row>"
intro: "<opening paragraph, shown beside the illustration>"
---
  <h2>First section</h2>
  ...
```

- `layout: note` and `nav: notes` come from `_config.yml` collection defaults.
- The `note` layout renders the illustration beside the `intro` paragraph (same `.recipe-intro` pairing recipes use) and the "Last updated" line automatically from `thumb_alt`/`last_modified_at`/`intro` &mdash; don't repeat any of them in the body, and don't add your own `.note-body` wrapper, the layout provides it.
- Body content starts at the first `<h2>` &mdash; the opening paragraph lives in `intro` instead.
- `date` is first publication; bump `last_modified_at` (an actual `YYYY-MM-DD` value, quotes optional) whenever a note gets a substantive edit. It drives the "Last updated" line, the sitemap and the structured data. Leave out `image` if the note has no illustration (the site default is used).
- A copy-paste command, config snippet, or prompt goes in a code block (see below).
- Use placeholders for anything personal in examples: `<your app id token>`, `acc_xxxx...`, `1111111`. Before publishing, grep the note for real account numbers, IDs, keys and names.
- Test any script you publish (at least `python3 -m py_compile`, ideally an offline run with faked API responses) and say in a `recipe-note` what the published version leaves out compared with the one you actually run.

### Flow charts

For a "how the pieces fit together" diagram, use the HTML flow (see the Akahu note) rather than an image or SVG: real text wraps on phones, follows the theme and is indexable.

```html
<ol class="flow">
  <li>
    <div class="flow-box">
      <strong>Step name</strong>
      <ul><li>What must be in place</li></ul>
      <p class="flow-fail">Missing: what you see when it isn't.</p>
    </div>
    <p class="flow-link">what passes to the next step</p>
  </li>
  <li><div class="flow-box">...last step, no flow-link...</div></li>
</ol>
```

The boxes use `--code-bg` / `--code-border`, the connector arrow is drawn in CSS (`.flow-link::before`/`::after`) in `--accent`.

### Code blocks and syntax highlighting

```html
<pre class="prompt-block" tabindex="0" data-lang="Python"><code class="language-python">print("hello")</code></pre>
```

- `tabindex="0"` lets keyboard users focus and scroll the block when a long line overflows.
- `data-lang` is the label shown above the block (pure CSS, `.prompt-block[data-lang]::before`). Free text: `Python`, `Bash`, `Shell`, `Config`, `Proxmark3`.
- `class="language-<id>"` on the `<code>` turns on highlighting. Ids in use: `python`, `bash` (also for `Shell` blocks), `ini` (Klipper/Snapmaker `.cfg`). Anything else in highlight.js's [common bundle](https://highlightjs.org/download) works without extra files (`json`, `yaml`, `javascript`, `xml` for HTML, ...).
- Leave the class off for AI prompts and commands highlight.js has no grammar for (Proxmark3): they stay plain. Highlighting only runs on `pre code[class*="language-"]`, so untagged blocks are never auto-detected.
- Escape the code: `<` `>` `&` must be `&lt;` `&gt;` `&amp;` inside `<pre>`. For a long script, generate the HTML with Python's `html.escape(code, quote=False)` rather than escaping by hand.
- `_layouts/note.html` loads highlight.js 11.9.0 from cdnjs (with an SRI `integrity` hash) only when the page content contains `class="language-`. Recipes don't load it; copy the same block into `_layouts/recipe.html` if one ever needs it. To upgrade, change the version in the URL and recompute the hash: `curl -s <url> | openssl dgst -sha384 -binary | openssl base64 -A`, prefixed with `sha384-`.
- Token colours are in `styles.css` (`.hljs-*` rules): keywords use `--accent`, comments `--text-muted`, strings and numbers `--code-string` / `--code-number`; the block itself uses `--code-bg` / `--code-border` (a slightly lighter panel, so blocks stand out in dark mode). These variables are defined in all four theme blocks (light, dark media query, forced light, forced dark); add new colours to all four or the manual theme toggle breaks them. No highlight.js theme stylesheet is loaded.
- If cdnjs is down the code shows unhighlighted but readable.
- Check both themes after a change. Headless Chrome is enough: `jekyll build`, `python3 -m http.server` in `_site`, then `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=900,2400 --virtual-time-budget=5000 --screenshot=out.png <url>` (add `--force-dark-mode --blink-settings=preferredColorScheme=0` for dark).

## Theme toggle

Every page follows system `prefers-color-scheme` by default, with a manual override via a `data-theme="light"`/`"dark"` attribute on `<html>`, set by clicking the split-circle icon button in the nav (`theme.js`) and persisted in `localStorage`. This all lives in `_layouts/default.html` &mdash; new pages get it for free via `layout: default` (or `recipe`/`note`, which both extend it). The three pieces, if you ever need to touch them:

1. The anti-flash inline `<script>` right after the `color-scheme` meta tag in `<head>` &mdash; applies a saved theme before first paint.
2. The icon button as the last item inside `<nav>`.
3. `<script src="js/theme.js"></script>` next to the `js/email.js` tag at the bottom of `<body>`.

Anything that needs to invert between themes (line-drawing illustrations so far) should use `filter: invert(var(--invert))` rather than its own `prefers-color-scheme` media query, so it respects the manual override too.

## SEO

- `jekyll-seo-tag` (bundled with `github-pages`) is called as `{% seo title=false %}` in `_layouts/default.html`. It writes the meta description, canonical URL, Open Graph and Twitter tags, and JSON-LD. `title=false` because the layout writes its own `<title>` (`<page title> - Wilson Fan`; the homepage is `Wilson Fan: Notes on Software and Recipes`). Don't add another `<meta name="description">`.
- `_config.yml` sets `author` (name and url; Google recommends the url), `locale: en_NZ`, a default `image` for every page, and `seo.type: BlogPosting` for both collections, so notes and recipes get article structured data with author, `datePublished` (`date`) and `dateModified` (`last_modified_at`).
- `jekyll-sitemap` takes `lastmod` from `last_modified_at`, falling back to `date`. Without either it uses the build time, which changes on every deploy, and Google learns to ignore it. Every collection page needs both.
- Share images are opaque copies in `images/social/<slug>.jpg`: the transparent PNGs render black-on-black on Facebook, LinkedIn and X. After adding an illustration, make one: composite the PNG on white and save as JPEG quality 85 (Pillow: `Image.new("RGBA", im.size, "white")`, `alpha_composite`, `convert("RGB")`).
- Hub pages set `permalink: /notes.html` / `/recipes.html` so their canonical and sitemap URLs match the nav links; without it Jekyll gives them `/notes`. Any new top-level page needs the same.
- `timezone: Pacific/Auckland` in `_config.yml` matters: GitHub Pages builds in UTC and silently skips pages whose `date` is in the future, so without it a note dated today (NZ) 404s until UTC catches up. Test with `TZ=UTC bundle exec jekyll build`.
- Keep descriptions under about 155 characters; Google truncates longer ones.
- Anything in the repo root that isn't site content goes in `exclude:` in `_config.yml` (currently `serve.sh` and the local Gemini key file), or Jekyll publishes it. A running `jekyll serve` doesn't reload `_config.yml`; restart it after config changes.
- Recipes also get schema.org `Recipe` JSON-LD from `_includes/recipe-jsonld.html` (included by `_layouts/recipe.html`). It parses the page's own HTML, so the body structure above is load-bearing: ingredients are the `<li>`s between `<h2>Ingredients</h2>` and the next `<h2>`; each later `<h2>` is a step section (its `<ol><li>`s, or its `<p>` if it has no list; `recipe-note`s are skipped). One section gives plain `HowToStep`s, several give `HowToSection`s. Pages without an Ingredients heading (the reference page) get none. Liquid can't decode HTML entities, so the include replaces the ones in use (`&deg;` `&mdash;` `&ndash;` `&frac12;` `&frac14;` `&middot;` `&nbsp;` `&amp;`) by hand: add any new entity there, or type the character directly. Verify with Google's Rich Results Test after deploying.
- Internal links: add `related: [slug, other-slug]` (file names without `.html`, notes and recipes can mix) to show a "Related" list at the bottom of a note or recipe (`_includes/related.html`, title + `hub_blurb`). Make it two-way: add the reverse link on the other page too. A misspelt slug is silently skipped, so check the built page. Also link inline where the text already names another page, using `{{ '/<slug>.html' | relative_url }}` in the body (front matter isn't rendered by Liquid, so use a plain `/<slug>.html` there, e.g. in `meta`).
- Check after a change: `grep -o 'rel="canonical"[^>]*' _site/<page>.html` and `grep -A1 '<loc>' _site/sitemap.xml`.

## Analytics

Cloudflare Web Analytics beacon is baked into `_layouts/default.html`, right before `</body>`, so every page gets it automatically. Cookie-free, no consent banner needed. Doesn't require the domain's DNS to be on Cloudflare.

## Style tokens

Colors, spacing, and component classes (`.recipe-body`, `.note-body`, `.ref-table`, etc.) all live in `css/styles.css`. Don't hardcode colors or one-off styles in a page &mdash; add a class to `css/styles.css` using the existing `--bg` / `--text` / `--text-muted` / `--accent` / `--border` custom properties so light and dark mode both stay correct.

Headlines (`.hero h1`, `.page-section h1`, `.wordmark`) use a self-hosted display serif (`--font-display`, Fraunces) instead of the system font stack &mdash; the two `.woff2` files live in `fonts/`. Body text, nav, and recipe/note content stay on the system stack for load speed; only large headline-scale text gets the display face.

The homepage hero also carries a `.hero-cta` &mdash; a specific "start here" link, not generic nav.
