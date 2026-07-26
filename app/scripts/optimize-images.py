"""Convert generated PNGs into web-weight JPEGs.

    python scripts/optimize-images.py <file-or-dir> [...]

ChatGPT hands back ~1.6 MB PNGs; the storefront only ever renders these at a
few hundred CSS pixels wide, so they go out as 1200px-wide progressive JPEGs.
Originals are left on disk untouched.
"""

import sys
from pathlib import Path
from PIL import Image

MAX_WIDTH = 1200
QUALITY = 82


def convert(src: Path) -> None:
    with Image.open(src) as im:
        im = im.convert("RGB")
        if im.width > MAX_WIDTH:
            im = im.resize(
                (MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)),
                Image.LANCZOS,
            )
        dst = src.with_suffix(".jpg")
        im.save(dst, "JPEG", quality=QUALITY, optimize=True, progressive=True)

    before = src.stat().st_size / 1024
    after = dst.stat().st_size / 1024
    print(f"{dst.name:<34} {im.width}x{im.height}  {before:.0f} KB -> {after:.0f} KB")


def main(args: list[str]) -> None:
    if not args:
        sys.exit(__doc__)
    for arg in args:
        path = Path(arg)
        targets = sorted(path.glob("*.png")) if path.is_dir() else [path]
        for png in targets:
            convert(png)


if __name__ == "__main__":
    main(sys.argv[1:])
