# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Flipslide is a zero-dependency, browser-based presentation renderer. Decks are authored in Markdown and rendered entirely client-side. There is no build step, no package manager, no transpilation. The entire renderer is two files: `flipslide.js` and `flipslide.css`.

## Running and Testing

Open `index.html` in a browser (works from `file://` or any HTTP server). The sample deck at `decks/sample/index.html` is self-contained with its own copies of the renderer files.

To run the built-in test suite, append `?test` to the URL (e.g. `index.html?test`). Tests appear as an overlay panel. The test suite validates YAML parsing, Markdown rendering, slide parsing, DOM structure, and navigation. Test expectations are hardcoded against the sample deck (7 slides).

## Architecture

`flipslide.js` is a single IIFE containing these internal modules as plain objects:

- **Yaml** — Minimal YAML parser (flat + nested objects, inline arrays, quoted strings, booleans, numbers)
- **Config** — Extracts the `<!-- flipslide:config ... -->` block from deck markdown, applies theme variables to `:root`, loads custom fonts via `@font-face`, injects external CSS
- **Markdown** — Purpose-built Markdown-to-HTML renderer (no external library). Handles H1/H2/H3, lists, tables, task lists, blockquotes, definition lists, footnotes, code blocks, images, and custom fenced blocks (`video`, `audio`, `callout`). Code blocks are protected with placeholders during processing.
- **Slides** — Splits deck content on `---`, parses per-slide metadata (`<!-- slide: -->` overrides, `<!-- notes: -->` speaker notes), detects split layouts (`***`), auto-applies content classes (`.has-list`, `.has-table`, `.image-only`, etc.)
- **Dom** — Builds slide `<section>` elements into `#fs-deck`, applies backgrounds, overrides, branding logos, progress bar, slide numbers
- **Nav** — Keyboard/click/touch/hash navigation. Arrow keys, Space, Home/End, F for fullscreen
- **AutoFit** — Iteratively shrinks font size on overflowing slides when `autofit: true` in config
- **Test** — In-browser test suite triggered by `?test` query param

**Boot sequence:** `loadDeck` → `Config.extract` → `Config.applyTheme/loadFonts/loadExternalCSS` → `Slides.split` → `Slides.parse` → `Dom.build` → `Nav.init` → `AutoFit.run` → `Test.run`

## Deck Format

- Slides separated by `---` on its own line
- `***` on its own line splits a slide into two columns (left/right)
- `___` renders as a visual separator within a slide
- `# Title` creates a title slide; `## Heading` creates a content slide; `### Sub` adds a smaller sub-heading
- Config block goes at the end of the markdown, wrapped in `<!-- flipslide:config ... -->`
- Per-slide overrides: `<!-- slide: bg=c, heading-size=6vw -->`
- Speaker notes: `<!-- notes: ... -->`

## CSS Design

All sizing uses `vw` units for viewport-proportional scaling. Theme values are CSS custom properties prefixed `--dm-` (e.g. `--dm-bg`, `--dm-accent`, `--dm-heading-font`). The YAML config `theme:` block maps to these properties.

Named themes live in `themes/`. Setting `name:` inside the `theme:` config block causes the renderer to load `themes/{name}.css` (relative to the deck's `index.html`) before applying any per-deck inline overrides. Individual `theme:` color keys always win over the named theme file. Available themes: `observatory` (dark navy, sky-blue accent), `crimson` (white background, dark slate text, crimson red accent).

Decks can also provide a custom CSS file for additional overrides via `external_css` in config, loaded after the named theme.

## Deck Loading

Two methods, tried in order:
1. Inline `<script id="fs-source" type="text/markdown">` in the HTML (works from `file://`)
2. XHR fallback to `deck.md` (requires HTTP server)

## Key Conventions

- No external dependencies — everything is self-contained vanilla JS (ES2017+)
- H1, H2, and H3 are supported — no H4 or deeper
- The `decks/sample/` folder contains its own copies of `flipslide.js`, `flipslide.css`, and `fonts/` so it works standalone
- HTML in deck markdown is not rendered (security: prevents XSS)
- The PRD (`flipslide-prd.md`) is the authoritative spec for features and behavior
