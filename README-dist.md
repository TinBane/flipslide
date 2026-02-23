# Flipslide

Zero-dependency, browser-based presentations. Write Markdown, open in a browser — that's it.

## Quick Start

1. Rename `template.html` to `index.html`
2. Edit the markdown inside the `<script id="fs-source" type="text/markdown">` tag
3. Open in any browser (works from `file://`)

## Slide Basics

Separate slides with `---` on its own line.

```
# Big Title           → title slide (centred)
## Heading            → content slide
### Smaller Sub-text  → sub-heading (lighter, smaller)
```

H1 and H2 determine slide layout. H3 is a decorative sub-heading only. H4+ are not supported.

Split a slide into two columns with `***`:

```
## Heading

Left content here

***

Right content here
```

Add a visual separator within a slide with `___`.

## Markdown Support

**Inline:** `**bold**` · `*italic*` · `` `code` `` · `~~strike~~` · `==highlight==` · `[link](url)` · `[^1]` footnotes

**Blocks:**

| Syntax | Result |
|--------|--------|
| `- item` | Bullet list |
| `1. item` | Numbered list |
| `- [ ] / - [x]` | Task list |
| `\| A \| B \|` | Table (GFM pipe syntax) |
| `> text` | Blockquote |
| `Term` + `: Def` | Definition list |
| `![alt](img.jpg)` | Image |
| ` ```callout ` | Big-number callout box |
| ` ```video ` | Embedded video |
| ` ```audio ` | Embedded audio |

**Notes:** `<!-- notes: Talking points here -->` (hidden in presentation)

**Per-slide overrides:** `<!-- slide: bg=a, heading-size=6vw, text=#fff -->`

## Themes

Set `name:` in the config to load a theme from `themes/`:

| Name | Look |
|------|------|
| `observatory` | Dark navy, sky-blue accent |
| `crimson` | White, dark text, crimson accent |
| `cloud-dancer` | Warm off-white, blue-purple tones |

Individual colour keys in `theme:` override the named theme. If no theme is set, defaults are dark (`#0c0c14` background, `#e94560` accent).

## Auto-Sizing

Set `autofit: true` in the config and Flipslide will automatically shrink text on slides that overflow. Lists, tables, blockquotes, and definition lists are all handled. You can set a floor with `autofit_min: "1.2vw"` to prevent text becoming unreadably small.

All sizes use `vw` units so everything scales proportionally with the viewport.

## Config Block

Goes at the very end of your markdown, wrapped in an HTML comment:

```
<!-- flipslide:config
theme:
  name: observatory
  heading_font: "fonts/Outfit-Variable.woff2"
  body_font: "fonts/InterVariable.woff2"
  slide_number: true
  progress_bar: true
  autofit: true

backgrounds:
  a:
    color: "#0f172a"
  b:
    color: "#1a1a2e"

background_map:
  title: a
  content: b

branding:
  logo: images/logo.svg
  logo_position: BR
  logo_size: 4vw
-->
```

## CSS Custom Properties

Override any of these in your theme or via `external_css`:

| Property | Default | Purpose |
|----------|---------|---------|
| `--dm-bg` | `#0c0c14` | Background colour |
| `--dm-text` | `#e8e6e3` | Text colour |
| `--dm-accent` | `#e94560` | Accent colour |
| `--dm-heading-font` | Outfit | Heading font family |
| `--dm-body-font` | Outfit | Body font family |
| `--dm-title-size` | `7vw` | H1 size on title slides |
| `--dm-heading-size` | `4.2vw` | H2 size on content slides |
| `--dm-body-size` | `2.4vw` | Body text size |
| `--dm-slide-padding` | `6vw 8vw` | Slide padding |

## Bundled Fonts

| Font | Style | Best for |
|------|-------|----------|
| **Outfit** | Geometric, modern | Creative, informal decks |
| **Inter** | Neutral, legible | Business, technical, data decks |

## Navigation

Arrow keys · Space · Home/End · F (fullscreen) · Click/touch

## Creating Decks with Claude Code

The repository includes a Claude Code skill for guided deck creation. Install the skill from the repo, then use `/create-deck [topic]` to generate a complete deck interactively.

Skill source: `skills/create-deck/SKILL.md` in the repository.

## More

Source, docs, and releases: https://github.com/TinBane/flipslide
