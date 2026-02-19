# Releasing Flipslide

## What Gets Released

The release artifact is `flipslide-renderer.zip` — a self-contained bundle of the renderer files and a template that the Claude Code skill (and anyone else) can download to create decks. It contains:

```
template.html
flipslide.js
flipslide.css
fonts/
├── Outfit-Variable.woff2
├── Outfit-OFL.txt
├── InterVariable.woff2
└── Inter-Outfit-OFL.txt
```

A `flipslide-renderer.zip.sha256` checksum file is produced alongside it.

The zip uses a **stable filename** (`flipslide-renderer.zip`, not versioned) so that the download URL stays consistent across releases:

```
https://github.com/TinBane/flipslide/releases/latest/download/flipslide-renderer.zip
```

GitHub's `/releases/latest/download/` always resolves to the most recent release, so the skill doesn't need to know the version number.

## Prerequisites

- `gh` CLI authenticated (`gh auth status`)
- You're on the `main` branch with a clean working tree
- All changes committed and pushed

## Creating a Release

### 1. Build the zip

```bash
./scripts/build-release.sh
```

This produces two files in `dist/`:
- `dist/flipslide-renderer.zip`
- `dist/flipslide-renderer.zip.sha256`

### 2. Tag and release

```bash
gh release create v0.1.0 \
  dist/flipslide-renderer.zip \
  dist/flipslide-renderer.zip.sha256 \
  --title "v0.1.0" \
  --notes "Initial release of the Flipslide renderer."
```

Replace `v0.1.0` with the appropriate version. Use semver:
- **Patch** (v0.1.1): Bug fixes, CSS tweaks
- **Minor** (v0.2.0): New features (new content types, config options)
- **Major** (v1.0.0): Breaking changes to deck format or config syntax

### 3. Verify

```bash
# Confirm the stable URL resolves
curl -sIL https://github.com/TinBane/flipslide/releases/latest/download/flipslide-renderer.zip | grep -i "^HTTP"

# Should show 302 → 200
```

## Verifying a Download

Recipients can verify the zip integrity:

```bash
sha256sum -c flipslide-renderer.zip.sha256
```

Or on macOS:

```bash
shasum -a 256 -c flipslide-renderer.zip.sha256
```
