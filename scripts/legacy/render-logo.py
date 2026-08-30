"""Yüksek çözünürlüklü GYO logosu: geometrik marka + Arial Bold yazı."""

from __future__ import annotations

from PIL import Image, ImageDraw, ImageFont

GREEN = (1, 86, 65)
WHITE = (255, 255, 255)
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
OUT = "/tmp/logo.png"
ASSET = "/Users/kontrolAdmin/.cursor/projects/Users-kontrolAdmin-gyo/assets/logo-hires.png"


def draw_mark(draw: ImageDraw.ImageDraw, size: int) -> None:
    stroke = max(10, size // 26)
    # Orijinalde 3 iç içe kare (dış çerçeve + 2 iç).
    for inset_frac in (0.0, 0.16, 0.30):
        inset = int(size * inset_frac) + stroke // 2
        draw.rectangle(
            [inset, inset, size - 1 - inset, size - 1 - inset],
            outline=GREEN,
            width=stroke,
        )
    margin = int(size * 0.04)
    diag = max(8, size // 36)
    draw.line([(margin, margin), (size - 1 - margin, size - 1 - margin)], fill=GREEN, width=diag)
    draw.line([(size - 1 - margin, margin), (margin, size - 1 - margin)], fill=GREEN, width=diag)
    cx = cy = size / 2
    r = size * 0.145
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=WHITE)


def fit_font(text: str, max_width: int, start: int) -> ImageFont.FreeTypeFont:
    size = start
    while size > 20:
        font = ImageFont.truetype(FONT, size)
        if font.getbbox(text)[2] <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(FONT, 20)


def main() -> None:
    scale = 4
    mark = 800
    gap = 64
    text_w = 1240
    height = mark
    width = mark + gap + text_w

    image = Image.new("RGB", (width * scale, height * scale), WHITE)
    draw = ImageDraw.Draw(image)

    draw_mark(draw, mark * scale)

    tx = (mark + gap) * scale
    draw.rectangle([tx, 0, width * scale - 1, height * scale - 1], fill=GREEN)

    lines = ["GARANTİ", "YATIRIM", "ORTAKLIĞI"]
    pad_x = 80 * scale
    font = fit_font(lines[-1], (text_w - 160) * scale, 168 * scale)
    bbox = font.getbbox("ÂĞİ")
    line_h = bbox[3] - bbox[1]
    gap_y = 28 * scale
    block_h = line_h * 3 + gap_y * 2
    y = (height * scale - block_h) // 2
    for line in lines:
        draw.text((tx + pad_x, y), line, font=font, fill=WHITE)
        y += line_h + gap_y

    image = image.resize((width, height), Image.Resampling.LANCZOS)
    image.save(OUT, "PNG")
    image.save(ASSET, "PNG")
    print(f"yazıldı {OUT} {image.size[0]}×{image.size[1]}")


if __name__ == "__main__":
    main()
