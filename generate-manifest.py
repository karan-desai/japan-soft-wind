#!/usr/bin/env python3
"""Scan photos-ghibli/ (curated Ghibli story frames) and write manifest.json."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PHOTOS = ROOT / "photos-ghibli"
OUT = ROOT / "manifest.json"

CHAPTERS = [
    {
        "id": "2026-05-22",
        "title": "The threshold at KIX",
        "place": "Kansai Airport · Osaka",
        "label": "Arrival",
    },
    {
        "id": "2026-05-23",
        "title": "Where the forest keeps secrets",
        "place": "Shrines · gardens",
        "label": "Day 1",
    },
    {
        "id": "2026-05-24",
        "title": "Tower, eaves, and moss hats",
        "place": "Kyoto · Otagi",
        "label": "Day 2",
    },
    {
        "id": "2026-05-25",
        "title": "Lantern gold, vermilion path",
        "place": "Yasaka · Fushimi Inari",
        "label": "Day 3",
    },
    {
        "id": "2026-05-26",
        "title": "Deer, bronze, quiet light",
        "place": "Nara · Tōdai-ji",
        "label": "Day 4",
    },
    {
        "id": "2026-05-27",
        "title": "Green blur and paper gourds",
        "place": "Shinkansen · Tokyo",
        "label": "Day 5",
    },
    {
        "id": "2026-05-28",
        "title": "Offerings and a concrete sail",
        "place": "Meiji · Yoyogi",
        "label": "Day 6",
    },
    {
        "id": "2026-05-29",
        "title": "The mountain finally shows",
        "place": "Chūreito · Kawaguchiko",
        "label": "Day 7",
    },
    {
        "id": "2026-05-30",
        "title": "Peace signs between stations",
        "place": "Trains · Ginza",
        "label": "Day 8",
    },
    {
        "id": "2026-05-31",
        "title": "Thin goodbye hours",
        "place": "Terminal · cabin",
        "label": "Departure",
    },
]

EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP"}


def scan_folder(folder_name: str) -> list[str]:
    folder = PHOTOS / folder_name
    if not folder.is_dir():
        return []
    files = sorted(
        p.name
        for p in folder.iterdir()
        if p.is_file() and p.suffix in EXTENSIONS and not p.name.startswith(".")
    )
    return [f"photos-ghibli/{folder_name}/{name}" for name in files]


def main() -> None:
    chapters = []
    total = 0
    for ch in CHAPTERS:
        images = scan_folder(ch["id"])
        total += len(images)
        chapters.append(
            {
                "id": ch["id"],
                "title": ch["title"],
                "place": ch["place"],
                "label": ch["label"],
                "images": images,
            }
        )

    manifest = {
        "generated": True,
        "photoRoot": "photos-ghibli",
        "style": "ghibli-story",
        "totalImages": total,
        "chapters": chapters,
    }
    OUT.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT.name}: {total} image(s) across {len(chapters)} chapters")


if __name__ == "__main__":
    main()
