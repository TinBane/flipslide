---
name: create-deck
description: Create a Flipslide presentation deck from a topic or outline. Generates a self-contained HTML slide deck using Markdown syntax that renders in any browser with no dependencies.
skill-version: v0.3.0
user-invocable: true
argument-hint: [topic or outline]
---

You are creating a Flipslide presentation deck. Flipslide is a zero-dependency, browser-based presentation renderer. The entire deck is a single HTML file with embedded Markdown — no build step, no package manager. It works from `file://` or any HTTP server.

## GitHub Repository

Flipslide source and releases: **https://github.com/TinBane/flipslide**

## Output Structure

Create a folder with this structure:

```
deck-name/
├── index.html       # Self-contained deck (HTML shell + embedded markdown)
├── flipslide.js     # Renderer
├── flipslide.css    # Styles
├── themes/          # Named theme CSS files (included in release zip)
│   └── observatory.css
├── fonts/           # Bundled fonts + licenses
│   ├── Outfit-Variable.woff2
│   ├── Outfit-OFL.txt              # Outfit license (SIL OFL)
│   ├── InterVariable.woff2
│   └── Inter-Outfit-OFL.txt        # Inter license (SIL OFL)
└── images/          # Any images referenced in slides
```

You'll rename `template.html` to `index.html` and edit only the markdown content inside the `<script id="fs-source" type="text/markdown">` tag. The HTML structure is already correct and ready to use. It follows this exact structure:

```html
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>DECK TITLE</title><link rel="stylesheet" href="flipslide.css"><style>body{opacity:0;transition:opacity .3s}body.fs-ready{opacity:1}</style></head><body><div id="fs-deck"></div><script id="fs-source" type="text/markdown">
DECK MARKDOWN GOES HERE
</script><script src="flipslide.js"></script></body></html>
```

The deck markdown is embedded directly inside the `<script id="fs-source" type="text/markdown">` tag. Do NOT create a separate `deck.md` file.

## Getting the Renderer Files

The deck needs `template.html`, `flipslide.js`, `flipslide.css`, and `fonts/` to be self-contained. Obtain them using one of these methods, tried in order:

1. **Local copy** — If the Flipslide repo is cloned locally (check for `flipslide.js` in the current project or nearby directories), copy the files directly.

2. **GitHub release zip** — Download and extract the latest release (recommended):
   ```bash
   curl -sL https://github.com/TinBane/flipslide/releases/latest/download/flipslide-renderer.zip -o /tmp/flipslide-renderer.zip
   unzip -o /tmp/flipslide-renderer.zip -d {deck-name}/
   mv {deck-name}/template.html {deck-name}/index.html
   ```
   This gives you everything you need, including a ready-to-use HTML template.

3. **Direct download** — If the release zip is unavailable, fetch individual files:
   ```bash
   mkdir -p {deck-name}/fonts
   curl -sL https://raw.githubusercontent.com/TinBane/flipslide/main/template.html -o {deck-name}/index.html
   curl -sL https://raw.githubusercontent.com/TinBane/flipslide/main/flipslide.js -o {deck-name}/flipslide.js
   curl -sL https://raw.githubusercontent.com/TinBane/flipslide/main/flipslide.css -o {deck-name}/flipslide.css
   curl -sL https://raw.githubusercontent.com/TinBane/flipslide/main/fonts/Outfit-Variable.woff2 -o {deck-name}/fonts/Outfit-Variable.woff2
   curl -sL https://raw.githubusercontent.com/TinBane/flipslide/main/fonts/Outfit-OFL.txt -o {deck-name}/fonts/Outfit-OFL.txt
   curl -sL https://raw.githubusercontent.com/TinBane/flipslide/main/fonts/InterVariable.woff2 -o {deck-name}/fonts/InterVariable.woff2
   curl -sL https://raw.githubusercontent.com/TinBane/flipslide/main/fonts/Inter-OFL.txt -o {deck-name}/fonts/Inter-OFL.txt
   ```

## Slide Format Reference

### Slide Separators

| Syntax | Purpose |
|--------|---------|
| `---`  | Separates slides |
| `***`  | Splits a slide into two columns (left/right) |
| `___`  | Visual horizontal rule within a slide |

### Slide Types

| Opening Element | Layout | Use |
|-----------------|--------|-----|
| `# Title` | Title slide (centered) | Section dividers, opening/closing |
| `# Title` + `## Subtitle` | Title with subtitle | Opening slides |
| `## Heading` | Content slide | Standard slides with content |
| `## Heading` + `### Sub` | Content with sub-heading | Slides needing context below the heading |
| *(no heading)* | Content slide | Standalone content (callouts, images) |

**H1, H2, and H3 are supported.** H4 and below render as plain text. H3 provides a smaller, lighter sub-heading — useful for dates, context lines, or section qualifiers placed below an H1 or H2. It does not affect slide type (only H1 and H2 determine title vs content layout).

### Content Types

Each slide should have **one primary content element**:

- **Bullet list:** `- item`
- **Numbered list:** `1. item`
- **Task list:** `- [ ] item` / `- [x] item`
- **Table:** GFM pipe syntax
- **Image:** `![alt](images/photo.jpg)` or external URL
- **Blockquote:** `> text`
- **Definition list:** `Term` on one line, `: Definition` on the next
- **Callout block:** Fenced block with `callout` language (for big numbers/stats)
- **Paragraph text:** For quotes or statement slides

### Inline Formatting

- `**bold**` and `*italic*`
- `` `inline code` ``
- `~~strikethrough~~`
- `==highlight==` (renders as `<mark>`)
- `[^1]` footnote reference + `[^1]: text` footnote definition

### Split (Two-Column) Layouts

Use `***` on its own line to split a slide into left/right columns:

```markdown
## Heading

![Photo](images/photo.jpg)

***

- Point one
- Point two
- Point three
```

The heading spans full width. Content before `***` goes left, after goes right. Default is 50/50. Override with `<!-- slide: split=40/60 -->`.

### Callout Blocks

For "big number" or key stat slides:

````markdown
```callout
$1.7M Revenue — +21% Growth
```
````

### Video and Audio

````markdown
```video
src: videos/demo.mp4
poster: images/poster.jpg
autoplay: false
controls: true
```
````

````markdown
```audio
src: sounds/ambient.mp3
loop: true
autoplay: true
```
````

### Speaker Notes

```markdown
<!-- notes: Talking points for this slide go here. -->
```

Notes are stored but not displayed in the presentation.

### Attribution / Source Lines

The last italic paragraph on a slide is auto-detected as an attribution line and styled small at the bottom:

```markdown
*Source: Gartner Q3 2025 Report*
```

### Per-Slide Overrides

```markdown
<!-- slide: bg=c, heading-size=6vw, text=#ffffff -->
```

| Key | Effect | Example |
|-----|--------|---------|
| `bg` | Background variant (a, b, c) | `bg=a` |
| `background` | Background image | `background=images/bg.jpg` |
| `bg-color` | Background color | `bg-color=#1a1a2e` |
| `text` | Text color | `text=#ffffff` |
| `accent` | Accent color | `accent=#ff6b6b` |
| `heading-size` | Heading font size | `heading-size=6vw` |
| `body-size` | Body font size | `body-size=2.5vw` |
| `padding` | Slide padding | `padding=3vw` |
| `split` | Column ratio for split slides | `split=40/60` |

## Available Themes

Instead of manually specifying colors in the config, you can use a named theme. The theme CSS file is loaded before any per-deck config values, so individual keys in `theme:` still override the theme for that property only.

| Theme | Background | Text | Accent | Character |
|-------|-----------|------|--------|-----------|
| `observatory` | `#0f172a` dark navy | `#f1f5f9` light slate | `#38bdf8` sky blue | Professional, technical, data-heavy |
| `crimson` | `#ffffff` white | `#1e293b` dark slate | `#c52d40` crimson red | Corporate reports, bold, high-contrast. Pair with a solid crimson title background: `backgrounds: a: color: "#c52d40"` and `background_map: title: a`. Recommended font: Inter. |
| `cloud-dancer` | `#f8f9fa` off-white | `#2c3e50` slate | `#6c63ff` vibrant purple | Modern, creative, visually rich. Includes SVG background support. |

To use a theme, set `name:` inside the `theme:` block:

```yaml
theme:
  name: observatory
  slide_number: true
  progress_bar: true
```

You can still override individual colors:

```yaml
theme:
  name: observatory
  accent: "#f97316"   # override just the accent; background and text come from the theme
```

When `name` is set, the renderer loads `themes/{name}.css` relative to the deck's `index.html`. The `themes/` folder is included in the release zip so no extra download is needed.

If no theme `name` is set and no colors are specified in `theme:`, the renderer falls back to the default dark palette in `flipslide.css` (`#0c0c14` background, `#e8e6e3` text, `#e94560` red accent).

### SVG Background Assets

The included SVG backgrounds are automatically theme-aware. Specify them in per-slide overrides or as background variants:

```yaml
backgrounds:
  a:
    image: "themes/images/bg-bold.svg"
    color: "#f8f9fa"
```

The `bg-bold.svg` file is included in the release zip and is automatically recolored to match your theme's accent and background colors — no manual editing needed. This creates visual drama and interest without extra design work.

## Bundled Fonts

Two variable fonts are included. Both support all weights in a single file.

| Font | File | Style | Best For |
|------|------|-------|----------|
| **Outfit** | `fonts/Outfit-Variable.woff2` | Geometric sans-serif, modern/friendly | Creative, startup, informal decks |
| **Inter** | `fonts/InterVariable.woff2` | Neutral sans-serif, highly legible | Business, technical, data-heavy decks |

Use them in the config block via `heading_font` and `body_font`. You can mix them (e.g. Outfit for headings, Inter for body) or use one for both.

## Config Block

The config block goes at the **very end** of the markdown, wrapped in an HTML comment:

```yaml
<!-- flipslide:config
theme:
  name: observatory
  heading_font: "fonts/Outfit-Variable.woff2"
  body_font: "fonts/Outfit-Variable.woff2"
  slide_number: true
  slide_number_format: "{current} / {total}"
  progress_bar: true
  transition: fade
  aspect_ratio: "16:9"
  autofit: true
  autofit_min: "1.2vw"

backgrounds:
  a:
    color: "#0f172a"
  b:
    color: "#1a1a2e"
  c:
    color: "#1e3a5f"

background_map:
  title: a
  content: b

slide_overrides:
  title:
    heading-size: "10vw"
  content:
    heading-size: "4.5vw"
-->
```

### Config Sections

**`theme:`** — Core visual settings. All color values must be quoted. Font paths are relative to the deck folder. Available keys: `background`, `text`, `accent`, `heading_font`, `body_font`, `slide_padding`, `slide_number` (bool), `slide_number_format`, `slide_number_location` (TL/TR/BL/BR), `progress_bar` (bool), `transition` (fade), `aspect_ratio`, `autofit` (bool), `autofit_min`.

**`backgrounds:`** — Named background variants (a, b, c, etc.). Each can have `image`, `color`, `size`, `position`.

**`background_map:`** — Maps slide types (`title`, `content`) to background variants.

**`slide_overrides:`** — CSS variable overrides by slide type (`title`, `content`, `image-only`). Keys map to `--dm-*` CSS properties.

**`branding:`** — Persistent logo. Keys: `logo` (path), `logo_position` (TL/TR/BL/BR), `logo_size`, `logo_opacity`, `logo_exclude` (array of 1-indexed slide numbers).

**`external_css:`** — Path to a custom CSS file loaded after `flipslide.css`.

## Example: Sample Deck

For a detailed reference of a complete dark-themed deck with professional styling, see the sample deck files in the Flipslide repository:

- **Markdown structure:** [decks/sample/deck.md](https://github.com/TinBane/flipslide/blob/main/decks/sample/deck.md) — Shows slide structure, tables, callouts, split layouts, speaker notes, and a complete config block
- **Theme styling:** [decks/sample/theme.css](https://github.com/TinBane/flipslide/blob/main/decks/sample/theme.css) — Custom CSS overrides for the dark theme
- **Live demo:** [decks/sample/index.html](https://github.com/TinBane/flipslide/blob/main/decks/sample/index.html) — Open in a browser to see the rendered result

The sample deck demonstrates a professional dark theme (`#0f172a` background, `#38bdf8` accent) with multiple content types (tables, callouts, images, lists, blockquotes) and advanced features (split layouts, background overrides, custom fonts).

## Authoring Guidelines

1. **Start with a title slide** using `# Title` (optionally with `## Subtitle`).
2. **End with a closing slide** (thank you, Q&A, or contact info).
3. **One idea per slide.** Keep slides focused — one content element each.
4. **Use the config block** for consistent theming rather than per-slide overrides.
5. **Choose a cohesive color palette.** Set `background`, `text`, and `accent` in the theme. Use 2-3 background variants for visual variety.
6. **Use callout blocks** for key metrics or statistics that deserve emphasis.
7. **Use split layouts** when pairing an image with bullet points or comparing two things.
8. **Add speaker notes** for context that helps the presenter but shouldn't be on screen.
9. **Add attribution lines** (italic at slide bottom) for data sources.
10. **Keep decks to 7-15 slides** for most presentations.
11. **All sizes use `vw` units** for viewport-proportional scaling.
12. **HTML is not rendered** in slides (security measure). Use only Markdown syntax.

## Version Checking and Updates

Before creating a deck, check if a newer version of Flipslide is available:

```bash
LATEST=$(curl -s https://api.github.com/repos/TinBane/flipslide/releases/latest | grep '"tag_name"' | head -1 | sed 's/.*v//;s/".*//')
CURRENT="0.3.0"  # Current known version
if [ "$LATEST" != "$CURRENT" ]; then
  echo "A new version is available: $LATEST (current: $CURRENT). Consider updating."
fi
```

When creating decks, inform the user if an update is available and suggest they download the latest release zip from:
**https://github.com/TinBane/flipslide/releases/latest**

## Sharing Custom Color Schemes via Pull Request

If you create a color scheme you love, consider contributing it back to the Flipslide project. This helps the community and ensures your theme receives maintenance.

**Before submitting a PR with a new theme:**

1. **Review the scheme for proprietary data:**
   - Colors are fine (hex values, RGB, HSL)
   - Font references are fine (system fonts, open-source font URLs)
   - Custom SVG graphics are fine (as long as they're original or properly licensed)
   - ❌ Do NOT include: customer names, company-specific logos, confidential imagery, proprietary design systems

2. **If assets exist** (custom SVGs, images):
   - Ensure they have explicit open-source licenses (CC0, MIT, etc.)
   - Or create original work that you own
   - Include `LICENSE` or `CREDITS` comments in the PR

3. **Create a theme file** following the existing structure:
   ```css
   /* themes/your-theme.css */
   :root {
     --dm-bg: #yourcolor;
     --dm-text: #yourcolor;
     --dm-accent: #yourcolor;
     /* ... other properties ... */
   }
   ```

4. **Open a pull request** to **https://github.com/TinBane/flipslide** with:
   - Theme CSS file
   - Brief description of the theme's character
   - Sample images or screenshots (optional)

The Flipslide maintainers will review for quality, inclusivity, and data privacy before merging.
