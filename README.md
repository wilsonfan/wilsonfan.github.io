# wilson.fan

Static site, no build step. Plain HTML + `styles.css`, deployed straight from `master` via GitHub Pages.

## Adding a recipe

Every recipe is its own HTML file at the repo root, linked as a card from `recipes.html`. Follow this pattern so new pages don't drift from the existing ones.

### 1. File name

`sous-vide-<dish>.html` (kebab-case, lowercase). Not sous vide? Drop that prefix but keep kebab-case, e.g. `roast-chicken.html`.

### 2. Page skeleton

Copy an existing recipe page (`sous-vide-pork-belly.html` is the shortest) and keep:

- `<head>`: same meta tags as other pages, just change `<title>` (`"<Dish> - Wilson Fan"`) and the `description`.
- Header nav and footer: copy verbatim from any existing page. `Recipes` link gets `aria-current="page"` (Notes doesn't).
- `<a class="back-link" href="recipes.html">&larr; Recipes</a>` right after opening `<section class="stack-section page-section">`.
- `<h1>` with the recipe name, then `<p class="recipe-meta">` with the one-line summary (temp/time, or prep/cook/serves for non-sous-vide dishes).
- Everything else goes inside `<div class="recipe-body">`.

### 3. Recipe body

- `<h2>Ingredients</h2>` + `<ul>`. Multiple components (sauce, garnish, etc.) get a `<p><strong>Component name</strong></p>` before their own `<ul>`.
- `<h2>Steps</h2>` (or a more specific heading like `<h2>Poach the pears</h2>` if the recipe has multiple stages) + `<ol>`.
- Optional `<p class="recipe-note">...</p>` for a callout worth highlighting (a tip, a warning, a substitution).
- If adapted from somewhere, close with `<p class="recipe-source">Source: <a href="..." target="_blank" rel="noopener">...</a></p>`.

### 4. Optional: line-drawing illustration

Recipe pages can carry a `.recipe-art` illustration between the meta line and the body, matching `wilson_burger.png`'s black ink line-drawing style (no color, no shading, no fill).

- Generate with a `gemini-2.5-flash-image` (Nano Banana) call, passing `wilson_burger.png` as the style-reference image alongside a prompt describing the dish. See git history for the exact prompt template used.
- Save as `<dish-name>.png` (same basename as the HTML file) with a transparent background — flood the near-white pixels to alpha 0 so `prefers-color-scheme: dark` can invert it cleanly (white lines on the dark page background instead of a visible white box).
- Generate a lossless `.webp` alongside it (`cwebp -lossless -z 9 -q 80`) and serve both via `<picture>`, same pattern as the homepage hero:

```html
<div class="recipe-art">
  <picture>
    <source srcset="<dish-name>.webp" type="image/webp">
    <img src="<dish-name>.png" alt="Line drawing of <dish>" width="1056" height="992">
  </picture>
</div>
```

Not every recipe needs one &mdash; skip it rather than force a mediocre illustration.

### 5. Add the row to `recipes.html`

Inside `.item-list`, add:

```html
<a class="item-list-row" href="sous-vide-<dish>.html">
  <div class="item-list-thumb">
    <picture>
      <source srcset="<dish-name>.webp" type="image/webp">
      <img src="<dish-name>.png" alt="" width="1056" height="992">
    </picture>
  </div>
  <div>
    <h2>Recipe Title</h2>
    <p>One-sentence hook, matches the tone of the others.</p>
  </div>
</a>
```

No illustration for this recipe? Use an empty `<div class="item-list-thumb"></div>` instead, so the title still lines up with the rows that have one.

### 6. Reference / working-notes pages

Not every page is a finished recipe — `sous-vide-reference.html` is a running table of time/temp trials by protein. Use `.ref-section`, `.table-wrap` + `.ref-table` for that shape instead of the ingredients/steps pattern. Keep raw trial notes (including "too raw", "try X next") rather than smoothing them into a single answer — the comparisons are the point.

## Adding a note

Notes live at the repo root too, linked from `notes.html`'s `.item-list` (same list component the recipes hub uses — it's generic, not recipe-specific). Follow the recipe conventions above for file naming, page skeleton, and illustrations, with these differences:

- Body wrapper is `<div class="note-body">`, not `.recipe-body` — same spacing rules, just not implying "recipe."
- Right after `<p class="section-lede">`, add `<p class="recipe-meta">Last updated <time datetime="YYYY-MM-DD">Month D, YYYY</time></p>` — keep the `datetime` and visible text in sync, and bump it whenever a note gets a substantive edit.
- A copy-paste command, config snippet, or prompt goes in `<pre class="prompt-block"><code>...</code></pre>`.
- Standalone illustration (no ingredients list to pair it with) uses `<div class="recipe-art recipe-art-standalone">` instead of the two-column `.recipe-intro` grid.

## Style tokens

Colors, spacing, and component classes (`.recipe-card`, `.recipe-body`, `.ref-table`, etc.) all live in `styles.css`. Don't hardcode colors or one-off styles in a page — add a class to `styles.css` using the existing `--bg` / `--text` / `--text-muted` / `--accent` / `--border` custom properties so light and dark mode both stay correct.
