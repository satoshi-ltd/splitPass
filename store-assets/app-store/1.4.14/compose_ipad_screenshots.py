#!/usr/bin/env python3
"""Compose the 13-inch iPad App Store screenshot set from native captures."""

from pathlib import Path

from PIL import Image, ImageCms, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent
SOURCE_DIR = ROOT / "source-ipad"
BACKGROUND_DIR = ROOT / "backgrounds"
FINAL_DIR = ROOT / "final-ipad"

CANVAS_SIZE = (2064, 2752)
ACCEPTED_SOURCE_SIZES = {(2064, 2752), (2048, 2732)}
CREAM = "#FFF9F3"
INK = "#181310"
ORANGE = "#F7683A"

REPO_ROOT = ROOT.parents[2]
FONT_DISPLAY = REPO_ROOT / "node_modules/@expo-google-fonts/doto/900Black/Doto_900Black.ttf"
# The bundled Canela cut has no Spanish glyphs (including accents and ñ).
# New York keeps the same editorial serif character while rendering the localized copy intact.
FONT_BODY = Path("/System/Library/Fonts/NewYork.ttf")
FONT_BODY_BOLD = REPO_ROOT / "assets/fonts/CanelaText-Bold.otf"

SLIDES = [
    {
        "source": "10-home.png",
        "output": "01-tus-secretos.png",
        "headline": "Tus secretos.\nSolo tuyos.",
        "subtitle": "Contraseñas, tarjetas, seeds y 2FA en una bóveda local cifrada.",
        "theme": "light",
        "transform": "normal",
    },
    {
        "source": "20-shards.png",
        "output": "02-divide-y-recupera.png",
        "headline": "Divide. Separa.\nRecupera.",
        "subtitle": "Cualquier 2 de 3 shards reconstruyen tu secreto.",
        "theme": "dark",
        "transform": "normal",
    },
    {
        "source": "30-totp.png",
        "output": "03-tu-2fa.png",
        "headline": "Tu 2FA también\nestá aquí.",
        "subtitle": "Códigos actualizados y listos para copiar.",
        "theme": "light",
        "transform": "mirror",
    },
    {
        "source": "40-card.png",
        "output": "04-mas-que-contrasenas.png",
        "headline": "Mucho más que\ncontraseñas.",
        "subtitle": "Guarda tarjetas y frases semilla sin mostrarlas.",
        "theme": "dark",
        "transform": "rotate",
    },
    {
        "source": "50-password-generator.png",
        "output": "05-contrasenas-fuertes.png",
        "headline": "Contraseñas fuertes,\nsin pensarlo.",
        "subtitle": "Elige longitud, números, mayúsculas y símbolos.",
        "theme": "light",
        "transform": "rotate",
    },
    {
        "source": "60-nfc.png",
        "output": "06-recupera-qr-nfc.png",
        "headline": "Recupera por QR\no split|Card NFC.",
        "subtitle": "Lee y guarda secretos en segundos.",
        "theme": "dark",
        "transform": "mirror",
    },
    {
        "source": "70-settings.png",
        "output": "07-privacidad.png",
        "headline": "Privacidad\na tu manera.",
        "subtitle": "Biometría, bloqueo automático, portapapeles temporal y copias cifradas.",
        "theme": "light",
        "transform": "normal",
    },
]


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


def wrapped_lines(draw: ImageDraw.ImageDraw, text: str, selected_font, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=selected_font)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def transform_background(background: Image.Image, transform: str) -> Image.Image:
    if transform == "mirror":
        return ImageOps.mirror(background)
    if transform == "rotate":
        return background.rotate(180)
    return background


def make_background(slide: dict) -> Image.Image:
    filename = "abstract-dark.png" if slide["theme"] == "dark" else "abstract-light.png"
    source = Image.open(BACKGROUND_DIR / filename).convert("RGB")
    source = transform_background(source, slide["transform"])
    background = ImageOps.fit(source, CANVAS_SIZE, Image.Resampling.LANCZOS)

    wash = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    wash_draw = ImageDraw.Draw(wash)
    if slide["theme"] == "dark":
        wash_draw.rectangle((0, 0, *CANVAS_SIZE), fill=(8, 7, 6, 45))
    else:
        wash_draw.rectangle((0, 0, *CANVAS_SIZE), fill=(255, 249, 243, 70))

    glow = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((1180, 220, 2260, 1210), fill=(247, 104, 58, 105))
    glow = glow.filter(ImageFilter.GaussianBlur(175))

    return Image.alpha_composite(Image.alpha_composite(background.convert("RGBA"), wash), glow)


def paste_tablet(canvas: Image.Image, screenshot_path: Path, theme: str) -> None:
    tablet_width = 1560
    tablet_height = 2080
    tablet_x = (CANVAS_SIZE[0] - tablet_width) // 2
    tablet_y = 600
    radius = 58

    with Image.open(screenshot_path) as source:
        screenshot = ImageOps.fit(source.convert("RGB"), (tablet_width, tablet_height), Image.Resampling.LANCZOS)

    mask = Image.new("L", screenshot.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, tablet_width - 1, tablet_height - 1),
        radius=radius,
        fill=255,
    )

    shadow = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle(
        (
            tablet_x - 20,
            tablet_y + 22,
            tablet_x + tablet_width + 20,
            tablet_y + tablet_height + 52,
        ),
        radius=radius + 20,
        fill=(0, 0, 0, 145 if theme == "light" else 205),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(38))
    canvas.alpha_composite(shadow)

    shell_size = (tablet_width + 28, tablet_height + 28)
    shell = Image.new("RGBA", shell_size, INK)
    shell_mask = Image.new("L", shell_size, 0)
    ImageDraw.Draw(shell_mask).rounded_rectangle(
        (0, 0, shell.width - 1, shell.height - 1),
        radius=radius + 14,
        fill=255,
    )
    canvas.paste(shell, (tablet_x - 14, tablet_y - 14), shell_mask)
    canvas.paste(screenshot, (tablet_x, tablet_y), mask)


def draw_header(canvas: Image.Image, slide: dict, index: int) -> None:
    draw = ImageDraw.Draw(canvas)
    dark = slide["theme"] == "dark"
    primary = CREAM if dark else INK
    secondary = "#E9DED3" if dark else "#5F5147"

    brand_font = font(FONT_DISPLAY, 48)
    index_font = font(FONT_DISPLAY, 40)
    headline_font = font(FONT_DISPLAY, 112)
    subtitle_font = font(FONT_BODY, 56)

    draw.rounded_rectangle((112, 56, 186, 130), radius=18, fill=ORANGE)
    draw.text((132, 55), "/", font=font(FONT_DISPLAY, 50), fill=INK)
    draw.text((214, 65), "split/Pass", font=brand_font, fill=primary)
    draw.text((1840, 72), f"{index:02d}", font=index_font, fill=secondary, anchor="ra")
    draw.line((1882, 96, 1970, 96), fill=ORANGE, width=8)

    draw.rounded_rectangle((112, 164, 126, 525), radius=7, fill=ORANGE)
    draw.multiline_text((174, 144), slide["headline"], font=headline_font, fill=primary, spacing=0)

    headline_box = draw.multiline_textbbox((174, 144), slide["headline"], font=headline_font, spacing=0)
    subtitle_y = headline_box[3] + 16
    subtitle_lines = wrapped_lines(draw, slide["subtitle"], subtitle_font, 1660)
    draw.multiline_text((174, subtitle_y), "\n".join(subtitle_lines), font=subtitle_font, fill=secondary, spacing=8)


def compose_slide(slide: dict, index: int) -> Image.Image:
    canvas = make_background(slide)
    paste_tablet(canvas, SOURCE_DIR / slide["source"], slide["theme"])
    draw_header(canvas, slide, index)
    return canvas.convert("RGB")


def save_rgb_png(image: Image.Image, path: Path) -> None:
    profile = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
    image.convert("RGB").save(path, format="PNG", optimize=True, icc_profile=profile)


def validate_output(path: Path) -> None:
    with Image.open(path) as image:
        if image.size != CANVAS_SIZE:
            raise ValueError(f"{path.name}: expected {CANVAS_SIZE}, got {image.size}")
        if image.mode != "RGB" or "A" in image.getbands():
            raise ValueError(f"{path.name}: expected RGB without alpha, got {image.mode}")


def make_contact_sheet(paths: list[Path], output: Path, labels: list[str]) -> None:
    thumb_width = 330
    thumb_height = round(thumb_width * CANVAS_SIZE[1] / CANVAS_SIZE[0])
    gap = 30
    label_height = 62
    columns = 4
    rows = 2
    width = columns * thumb_width + (columns + 1) * gap
    height = rows * (thumb_height + label_height) + (rows + 1) * gap
    sheet = Image.new("RGB", (width, height), "#12100F")
    sheet_draw = ImageDraw.Draw(sheet)
    label_font = font(FONT_BODY_BOLD, 24)

    for index, (path, label) in enumerate(zip(paths, labels)):
        row, column = divmod(index, columns)
        x = gap + column * (thumb_width + gap)
        y = gap + row * (thumb_height + label_height + gap)
        with Image.open(path) as source:
            preview = source.convert("RGB").resize((thumb_width, thumb_height), Image.Resampling.LANCZOS)
        sheet.paste(preview, (x, y))
        sheet_draw.text((x, y + thumb_height + 14), label, font=label_font, fill=CREAM)

    sheet.save(output, format="JPEG", quality=92, optimize=True)


def validate_inputs() -> None:
    required = [
        FONT_DISPLAY,
        FONT_BODY,
        FONT_BODY_BOLD,
        BACKGROUND_DIR / "abstract-dark.png",
        BACKGROUND_DIR / "abstract-light.png",
        *[SOURCE_DIR / slide["source"] for slide in SLIDES],
    ]
    missing = [path for path in required if not path.is_file()]
    if missing:
        details = "\n".join(f"  - {path}" for path in missing)
        raise FileNotFoundError(f"Missing iPad composition inputs:\n{details}")

    invalid_sizes = []
    for slide in SLIDES:
        path = SOURCE_DIR / slide["source"]
        with Image.open(path) as source:
            if source.size not in ACCEPTED_SOURCE_SIZES:
                invalid_sizes.append(f"{path.name}: {source.size[0]}x{source.size[1]}")
    if invalid_sizes:
        accepted = ", ".join(f"{width}x{height}" for width, height in sorted(ACCEPTED_SOURCE_SIZES))
        details = "\n".join(f"  - {item}" for item in invalid_sizes)
        raise ValueError(f"iPad sources must use an accepted 13-inch portrait size ({accepted}):\n{details}")


def main() -> None:
    validate_inputs()
    FINAL_DIR.mkdir(parents=True, exist_ok=True)

    outputs: list[Path] = []
    for index, slide in enumerate(SLIDES, start=1):
        output = FINAL_DIR / slide["output"]
        save_rgb_png(compose_slide(slide, index), output)
        validate_output(output)
        outputs.append(output)

    make_contact_sheet(
        outputs,
        ROOT / "preview-ipad-contact-sheet.jpg",
        [f"{index:02d}" for index in range(1, len(SLIDES) + 1)],
    )
    make_contact_sheet(
        [SOURCE_DIR / slide["source"] for slide in SLIDES],
        ROOT / "source-ipad-contact-sheet.jpg",
        [f"Fuente {index:02d}" for index in range(1, len(SLIDES) + 1)],
    )

    print(f"Generated {len(outputs)} iPad screenshots in {FINAL_DIR}")


if __name__ == "__main__":
    main()
