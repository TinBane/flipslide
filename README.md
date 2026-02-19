# Flipslide

A zero-dependency, browser-based presentation renderer. Author decks in Markdown, render them instantly in any browser.

## What is Flipslide?

Flipslide turns `.md` files into beautiful slide decks that run entirely client-side. No build step, no package manager, no external dependencies. Your entire deck is a single self-contained HTML file—works from `file://` or any HTTP server.

**Perfect for:**

- Quickly spinning up presentations from Markdown
- LLM-friendly deck authoring (Claude can generate decks)
- Sharing decks with a single folder
- Custom branding with CSS overrides

## Quick Start

### Option 1: Use the Claude Code Skill

If you have Claude Code installed:

```bash
/flipslide:create-deck My Presentation Topic
```

The skill creates a self-contained deck folder with all renderer files included. Choose your fonts, colors, and content structure—Claude does the rest.

First, install the Flipslide plugin:

```bash
/plugin install flipslide@TinBane/flipslide
```

Then create a deck:

```bash
/flipslide:create-deck My Presentation Topic
```

### Option 2: Manual Setup

1. Download the latest release: [flipslide-renderer.zip](https://github.com/TinBane/flipslide/releases/latest/download/flipslide-renderer.zip)

2. Create a deck folder:
   
   ```bash
   mkdir my-deck
   unzip flipslide-renderer.zip -d my-deck/
   ```

3. Write your slides as Markdown in the `<script>` tag of `index.html` (see `decks/sample/index.html`)

4. Open `index.html` in your browser

## Features

- **Markdown-based** — Slides separated by `---`
- **Two-column layouts** — Use `***` to split slides left/right
- **Rich content** — Tables, lists, task lists, blockquotes, images, video/audio, callouts
- **Themeable** — Choose colors, fonts, spacing via YAML config block
- **Fully self-contained** — Single HTML file, no network required
- **Keyboard + touch** — Arrow keys, Space, swipe, fullscreen (F key)
- **Speaker notes** — Annotate slides without showing on screen
- **Responsive** — All sizing in viewport units (`vw`) for perfect scaling
- **Lightweight** — Renderer + default font = ~400KB gzipped

## Deck Format at a Glance

```markdown
# My Presentation
## Subtitle

---

## Slide 1

- Bullet point
- Another point

---

## Split Layout

![Photo](images/photo.jpg)

***

- Point A
- Point B

---

<!-- flipslide:config
theme:
  background: "#0f172a"
  text: "#f1f5f9"
  accent: "#38bdf8"
  heading_font: "fonts/Outfit-Variable.woff2"
  body_font: "fonts/Outfit-Variable.woff2"
-->
```

## Fonts Included

- **Outfit** — Geometric, modern sans-serif. Good for creative/startup decks.
- **Inter** — Neutral, highly legible sans-serif. Good for business/technical decks.

Both are variable fonts (all weights in a single file) with SIL Open Font Licenses included.

## Sample Deck

Open `decks/sample/index.html` in your browser to see a working example.

## License

MIT - see LICENSE.txt, fonts included in this project are done so under their own licenses which are included and must be distributed with those files.
