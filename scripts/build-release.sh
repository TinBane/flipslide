#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$REPO_ROOT/dist"
ZIP_NAME="flipslide-renderer.zip"

# Verify required files exist
for f in flipslide.js flipslide.css template.html fonts/Outfit-Variable.woff2 fonts/Outfit-OFL.txt fonts/InterVariable.woff2 fonts/Inter-OFL.txt; do
    if [[ ! -f "$REPO_ROOT/$f" ]]; then
        echo "error: missing $f" >&2
        exit 1
    fi
done

# Clean and create dist/
rm -rf "$DIST"
mkdir -p "$DIST"

# Build zip from repo root so paths are flat (no leading directories)
cd "$REPO_ROOT"
zip -q "$DIST/$ZIP_NAME" \
    template.html \
    flipslide.js \
    flipslide.css \
    fonts/Outfit-Variable.woff2 \
    fonts/Outfit-OFL.txt \
    fonts/InterVariable.woff2 \
    fonts/Inter-OFL.txt

# Generate SHA-256 checksum
cd "$DIST"
shasum -a 256 "$ZIP_NAME" > "$ZIP_NAME.sha256"

echo "built: $DIST/$ZIP_NAME"
echo "sha256: $(cat "$ZIP_NAME.sha256")"
