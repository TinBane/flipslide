Create a Flipslide presentation deck for the user based on their topic or outline.

## Steps

1. Ask clarifying questions if the topic is vague (audience, tone, key points)
2. Create the deck folder: `{deck-name}/`
3. Get the renderer files into the folder using one of these methods (in order of preference):
   - **Local:** If inside the flipslide repo or it exists nearby, copy `template.html`, `flipslide.js`, `flipslide.css`, and `fonts/` directly, then rename `template.html` to `index.html`
   - **Release zip:** `curl -sL https://github.com/TinBane/flipslide/releases/latest/download/flipslide-renderer.zip -o /tmp/flipslide-renderer.zip && unzip -o /tmp/flipslide-renderer.zip -d {deck-name}/ && mv {deck-name}/template.html {deck-name}/index.html`
   - **Direct download:** `curl` files individually from `https://raw.githubusercontent.com/TinBane/flipslide/main/` — download `template.html` as `index.html`, plus `flipslide.js`, `flipslide.css`, and all font files
4. Edit `index.html` and replace only the markdown content inside the `<script id="fs-source" type="text/markdown">` tag. The HTML structure is already correct.
5. Choose an appropriate color scheme for the topic (dark themes work well for business/tech, lighter themes for creative/educational). Update the `theme:` section in the config block.
6. If the user provides images, place them in `{deck-name}/images/` and reference them in the markdown
7. Generate SVG placeholder images when appropriate for visual slides (diagrams, icons, illustrations)

## Color Palette Suggestions

**Dark professional:** bg `#0f172a`, text `#f1f5f9`, accent `#38bdf8`
**Dark warm:** bg `#1a1a2e`, text `#e0e0e0`, accent `#e94560`
**Dark green:** bg `#0d1117`, text `#e6edf3`, accent `#3fb950`
**Light clean:** bg `#ffffff`, text `#1e293b`, accent `#2563eb`
**Light warm:** bg `#fefce8`, text `#1c1917`, accent `#d97706`
