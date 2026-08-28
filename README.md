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

### 4. Add the card to `recipes.html`

Inside `.recipe-grid`, add:

```html
<a class="recipe-card" href="sous-vide-<dish>.html">
  <h2>Recipe Title</h2>
  <p>One-sentence hook, matches the tone of the others.</p>
</a>
```

### 5. Reference / working-notes pages

Not every page is a finished recipe — `sous-vide-reference.html` is a running table of time/temp trials by protein. Use `.ref-section`, `.table-wrap` + `.ref-table` for that shape instead of the ingredients/steps pattern. Keep raw trial notes (including "too raw", "try X next") rather than smoothing them into a single answer — the comparisons are the point.

## Style tokens

Colors, spacing, and component classes (`.recipe-card`, `.recipe-body`, `.ref-table`, etc.) all live in `styles.css`. Don't hardcode colors or one-off styles in a page — add a class to `styles.css` using the existing `--bg` / `--text` / `--text-muted` / `--accent` / `--border` custom properties so light and dark mode both stay correct.
