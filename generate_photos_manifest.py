#!/usr/bin/env python3
"""
generate_photos_manifest.py — scans photos/ and writes photos-manifest.json.

Run automatically by .github/workflows/update-photos-manifest.yml on every
push that touches photos/, so a static host like GitHub Pages (which can't
execute photos.php) still reflects the folder's current contents — add a
file, push, and it appears; delete one, push, and it's gone. Mirrors
photos.php's own scanning rules exactly (same prefix matching, same
extension filter, same natural sort) so behaviour matches regardless of
which of the two a given deployment ends up using.
"""
import json
import re
from pathlib import Path

KNOWN_BUILDINGS = ["admin", "lab", "tech", "dorm", "college"]
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp"}


def natural_key(name):
    return [int(tok) if tok.isdigit() else tok for tok in re.split(r"(\d+)", name)]


def main():
    root = Path(__file__).parent
    photos_dir = root / "photos"
    result = {b: [] for b in KNOWN_BUILDINGS}

    if photos_dir.is_dir():
        for f in sorted(photos_dir.iterdir()):
            if not f.is_file():
                continue
            if f.suffix.lower() not in ALLOWED_EXT:
                continue
            prefix = f.name.split("-")[0]
            if prefix not in KNOWN_BUILDINGS:
                continue
            result[prefix].append(f"photos/{f.name}")

    for b in result:
        result[b].sort(key=natural_key)

    out_path = root / "photos-manifest.json"
    out_path.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    total = sum(len(v) for v in result.values())
    print(f"Wrote {out_path.name}: {total} photo(s) found across {len(result)} buildings.")


if __name__ == "__main__":
    main()
