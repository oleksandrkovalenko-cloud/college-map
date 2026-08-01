#!/usr/bin/env python3
"""
generate_photos_manifest.py — scans photos/ and writes photos-manifest.json.

Run automatically by .github/workflows/update-photos-manifest.yml on every
push that touches photos/, so photos-manifest.json (the first tier
script.js's loadDynamicPhotos() checks) reflects the current contents on
hosts like GitHub Pages.

Layout (arbitrary filenames and counts inside each folder — only the
extension matters):
  photos/admin/*.jpg|jpeg|png|webp   — admin corpus, any number of files
  photos/lab/*                       — lab corpus
  photos/tech/*                      — tech corpus
  photos/dorm/*                      — dormitory
  photos/college-1.*                 — the single main college photo
                                        (fixed name, extension flexible)
"""
import json
import re
from pathlib import Path

BUILDING_FOLDERS = ["admin", "lab", "tech", "dorm"]
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp"}


def natural_key(name):
    return [int(tok) if tok.isdigit() else tok for tok in re.split(r"(\d+)", name)]


def scan_folder(folder):
    if not folder.is_dir():
        return []
    files = [f for f in folder.iterdir() if f.is_file() and f.suffix.lower() in ALLOWED_EXT]
    files.sort(key=lambda f: natural_key(f.name))
    return [f"photos/{folder.name}/{f.name}" for f in files]


def find_college_photo(photos_dir):
    for ext in sorted(ALLOWED_EXT):
        candidate = photos_dir / f"college-1{ext}"
        if candidate.is_file():
            return [f"photos/{candidate.name}"]
    return []


def main():
    root = Path(__file__).parent
    photos_dir = root / "photos"
    result = {}

    for name in BUILDING_FOLDERS:
        result[name] = scan_folder(photos_dir / name)
    result["college"] = find_college_photo(photos_dir)

    out_path = root / "photos-manifest.json"
    out_path.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    total = sum(len(v) for v in result.values())
    print(f"Wrote {out_path.name}: {total} photo(s) found across {len(result)} categories.")


if __name__ == "__main__":
    main()
