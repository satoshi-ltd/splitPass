#!/usr/bin/env python3
"""Compose App Store marketing screenshots from simulator captures."""

from pathlib import Path

from PIL import Image, ImageCms, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent
SOURCE_DIR = ROOT / "source"
BACKGROUND_DIR = ROOT / "backgrounds"
FINAL_DIR = ROOT / "final"

CANVAS_SIZE = (1320, 2868)
CREAM = "#FFF9F3"
INK = "#181310"
ORANGE = "#F7683A"

REPO_ROOT = ROOT.parents[2]
FONT_DISPLAY = REPO_ROOT / "node_modules/@expo-google-fonts/doto/900Black/Doto_900Black.ttf"
FONT_BODY = Path("/System/Library/Fonts/NewYork.ttf")
FONT_BODY_BOLD = Path("/System/Library/Fonts/SFNS.ttf")

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
    glow_draw.ellipse((780, 390, 1500, 1220), fill=(247, 104, 58, 105))
    glow = glow.filter(ImageFilter.GaussianBlur(135))

    return Image.alpha_composite(Image.alpha_composite(background.convert("RGBA"), wash), glow)


def paste_phone(canvas: Image.Image, screenshot_path: Path, theme: str) -> None:
    phone_width = 1040
    phone_height = round(phone_width * CANVAS_SIZE[1] / CANVAS_SIZE[0])
    phone_x = (CANVAS_SIZE[0] - phone_width) // 2
    phone_y = 655
    radius = 96

    screenshot = Image.open(screenshot_path).convert("RGB")
    screenshot = screenshot.resize((phone_width, phone_height), Image.Resampling.LANCZOS)

    mask = Image.new("L", screenshot.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, phone_width - 1, phone_height - 1), radius=radius, fill=255)

    shadow = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle(
        (phone_x - 18, phone_y + 22, phone_x + phone_width + 18, phone_y + phone_height + 58),
        radius=radius + 20,
        fill=(0, 0, 0, 150 if theme == "light" else 210),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(34))
    canvas.alpha_composite(shadow)

    shell = Image.new("RGBA", (phone_width + 24, phone_height + 24), INK)
    shell_mask = Image.new("L", shell.size, 0)
    ImageDraw.Draw(shell_mask).rounded_rectangle((0, 0, shell.width - 1, shell.height - 1), radius=radius + 12, fill=255)
    canvas.paste(shell, (phone_x - 12, phone_y - 12), shell_mask)
    canvas.paste(screenshot, (phone_x, phone_y), mask)


def draw_header(canvas: Image.Image, slide: dict, index: int) -> None:
    draw = ImageDraw.Draw(canvas)
    dark = slide["theme"] == "dark"
    primary = CREAM if dark else INK
    secondary = "#E9DED3" if dark else "#5F5147"

    brand_font = font(FONT_DISPLAY, 38)
    index_font = font(FONT_DISPLAY, 32)
    headline_font = font(FONT_DISPLAY, 96)
    subtitle_font = font(FONT_BODY, 44)

    draw.rounded_rectangle((76, 66, 137, 127), radius=16, fill=ORANGE)
    draw.text((92, 67), "/", font=font(FONT_DISPLAY, 42), fill=INK)
    draw.text((158, 73), "split/Pass", font=brand_font, fill=primary)
    draw.text((1152, 79), f"{index:02d}", font=index_font, fill=secondary, anchor="ra")
    draw.line((1180, 102, 1242, 102), fill=ORANGE, width=7)

    draw.rounded_rectangle((76, 172, 88, 521), radius=6, fill=ORANGE)
    draw.multiline_text((124, 157), slide["headline"], font=headline_font, fill=primary, spacing=2)

    headline_box = draw.multiline_textbbox((124, 157), slide["headline"], font=headline_font, spacing=2)
    subtitle_y = headline_box[3] + 25
    subtitle_lines = wrapped_lines(draw, slide["subtitle"], subtitle_font, 1050)
    draw.multiline_text((124, subtitle_y), "\n".join(subtitle_lines), font=subtitle_font, fill=secondary, spacing=10)


def compose_slide(slide: dict, index: int) -> Image.Image:
    canvas = make_background(slide)
    paste_phone(canvas, SOURCE_DIR / slide["source"], slide["theme"])
    draw_header(canvas, slide, index)
    return canvas.convert("RGB")


def save_rgb_png(image: Image.Image, path: Path) -> None:
    profile = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
    image.convert("RGB").save(path, format="PNG", optimize=True, icc_profile=profile)


def make_contact_sheet(paths: list[Path], output: Path, labels: list[str]) -> None:
    thumb_width = 285
    thumb_height = round(thumb_width * CANVAS_SIZE[1] / CANVAS_SIZE[0])
    gap = 26
    label_height = 58
    columns = 4
    rows = 2
    width = columns * thumb_width + (columns + 1) * gap
    height = rows * (thumb_height + label_height) + (rows + 1) * gap
    sheet = Image.new("RGB", (width, height), "#12100F")
    sheet_draw = ImageDraw.Draw(sheet)
    label_font = font(FONT_BODY_BOLD, 23)

    for index, (path, label) in enumerate(zip(paths, labels)):
        row, column = divmod(index, columns)
        x = gap + column * (thumb_width + gap)
        y = gap + row * (thumb_height + label_height + gap)
        preview = Image.open(path).convert("RGB").resize((thumb_width, thumb_height), Image.Resampling.LANCZOS)
        sheet.paste(preview, (x, y))
        sheet_draw.text((x, y + thumb_height + 14), label, font=label_font, fill=CREAM)

    sheet.save(output, format="JPEG", quality=92, optimize=True)


def main() -> None:
    FINAL_DIR.mkdir(parents=True, exist_ok=True)
    outputs: list[Path] = []
    for index, slide in enumerate(SLIDES, start=1):
        output = FINAL_DIR / slide["output"]
        save_rgb_png(compose_slide(slide, index), output)
        outputs.append(output)

    make_contact_sheet(outputs, ROOT / "preview-contact-sheet.jpg", [f"{index:02d}" for index in range(1, 8)])
    make_contact_sheet(
        [SOURCE_DIR / slide["source"] for slide in SLIDES],
        ROOT / "source-contact-sheet.jpg",
        [f"Fuente {index:02d}" for index in range(1, 8)],
    )


if __name__ == "__main__":
    main()
