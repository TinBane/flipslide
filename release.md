# Flipslide Release Process

This document outlines the steps for creating and publishing a new release of Flipslide.

## Pre-Release Checklist

- [ ] All feature work is complete and merged to `main`
- [ ] Tests pass: `open index.html?test` in a browser
- [ ] Sample deck renders correctly: `open decks/sample/index.html`
- [ ] `build-release.sh` completes successfully
- [ ] No uncommitted changes in the working directory
- [ ] No private data, customer logos, or confidential assets in the repo

## Step 1: Determine the Version

Run this to determine the next version:

```bash
CURRENT=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
echo "Current version: $CURRENT"
```

Use **semantic versioning**: `vX.Y.Z`
- **X** (major): Breaking changes to deck format, config, or renderer API
- **Y** (minor): New features (themes, SVG assets, new content types)
- **Z** (patch): Bug fixes, performance, documentation

**Examples:**
- `v1.2.0` — Added cloud-dancer theme, ContentFit module
- `v1.2.1` — Fixed table cell padding overflow
- `v2.0.0` — Redesigned config format (breaking change)

### Ask the Operator

Prompt the user:

```
Current version: {CURRENT}
Next version options:
1. Patch (v1.2.1) — Bug fixes and small improvements
2. Minor (v1.3.0) — New features
3. Major (v2.0.0) — Breaking changes
4. Other (specify manually)

Which version? [1/2/3/4]:
```

Store the chosen version for the next steps.

## Step 2: Build the Release Package

Run the build script to create the distribution zip:

```bash
./scripts/build-release.sh
```

This will:
- Verify all required files exist
- Create `dist/flipslide-renderer.zip`
- Generate `dist/flipslide-renderer.zip.sha256` checksum

**Verify the output:**
```bash
ls -lh dist/
unzip -l dist/flipslide-renderer.zip | head -20
```

Should include:
- `template.html`
- `flipslide.js` (with ContentFit module)
- `flipslide.css`
- `themes/observatory.css`, `themes/crimson.css`, `themes/cloud-dancer.css`
- `themes/images/bg-bold.svg`
- `fonts/Outfit-Variable.woff2`, `fonts/InterVariable.woff2`

## Step 3: Update Skill Documentation

The `skills/create-deck/SKILL.md` file should reference the version being released. This ensures users know which Flipslide version the skill's guidance applies to.

**Add a version reference at the top of the skill:**

```yaml
---
name: create-deck
description: Create a Flipslide presentation deck...
skill-version: v1.2.0  # This skill guidance applies to this Flipslide version
user-invocable: true
---
```

**Also update the version check section** in the skill to reference the current version:

```bash
LATEST=$(curl -s https://api.github.com/repos/TinBane/flipslide/releases/latest | grep '"tag_name"' | head -1 | sed 's/.*v//;s/".*//')
CURRENT="1.2.0"  # e.g., "1.2.0"
```

This way, the skill can inform users if they're using an outdated release.

## Step 4: Create a Git Commit

Stage all changes and create a release commit:

```bash
git add -A
git commit -m "Release v{VERSION}"
```

Example:
```bash
git commit -m "Release v1.2.0

- Add ContentFit module for intelligent list/table/text overflow prevention
- Add cloud-dancer theme (modern, light, purple accent)
- Enhance table compression with Pass 1.5 (cell padding, border-spacing)
- Improve skill documentation with version checks and PR guidelines
- Update build-release.sh to include new theme and SVG assets"
```

## Step 5: Create a Git Tag

Tag the release for easy reference:

```bash
git tag -a v{VERSION} -m "Release v{VERSION}"
```

Example:
```bash
git tag -a v1.2.0 -m "Release v1.2.0: ContentFit, cloud-dancer theme, enhanced tables"
```

## Step 6: Push to GitHub

Push the commit and tag to the remote:

```bash
git push origin main
git push origin v{VERSION}
```

## Step 7: Create a GitHub Release

This makes the distribution zip available for download.

```bash
gh release create v{VERSION} \
  --title "Flipslide {VERSION}" \
  --notes-file RELEASE_NOTES.md \
  dist/flipslide-renderer.zip
```

**Typical release notes:**

```markdown
## Features

- **ContentFit Module**: Three-pass intelligent overflow prevention
  - Pass 1: Compress list/definition list/blockquote spacing
  - Pass 1.5: Compress table cell padding and border-spacing
  - Pass 2: Reduce font-size on structural elements
  - Pass 3: Reduce overall slide font-size as fallback

- **Cloud-Dancer Theme**: Modern light theme with purple accent

## Improvements

- Bundled theme CSS files in release zip
- Included `themes/images/bg-bold.svg` for decorative backgrounds
- Enhanced skill documentation with version checking and PR guidelines

## Download

Download `flipslide-renderer.zip` and extract to create a new deck.
```

The zip file will be accessible at:
```
https://github.com/TinBane/flipslide/releases/download/v{VERSION}/flipslide-renderer.zip
```

## Verification

After creating the release:

1. **Check GitHub:**
   ```
   https://github.com/TinBane/flipslide/releases
   ```
   Verify the tag, notes, and zip file are visible.

2. **Test the zip download:**
   ```bash
   curl -sL https://github.com/TinBane/flipslide/releases/download/v{VERSION}/flipslide-renderer.zip -o /tmp/test-release.zip
   unzip -l /tmp/test-release.zip | head -20
   ```

3. **Verify checksum:**
   ```bash
   shasum -a 256 dist/flipslide-renderer.zip
   cat dist/flipslide-renderer.zip.sha256
   ```
   Both should match.

## Rollback

If you need to rollback a release:

```bash
git push origin --delete v{VERSION}  # Delete tag
gh release delete v{VERSION}          # Delete GitHub release
git reset --soft HEAD~1               # Undo commit (keeps changes staged)
```

Then make fixes and try again.

## Post-Release

1. Announce the release in relevant channels
2. Update any documentation that references version numbers
3. Monitor for issues reported by users
4. Consider updating the skill with the new release info
