from io import BytesIO

from PIL import Image, ImageDraw


def strokes_to_image(strokes: list, width: int = 1024, height: int = 512) -> bytes:
    """Rasterize stroke data into a placeholder image for future OCR providers."""
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)

    for stroke in strokes:
        points = stroke.get("points", [])
        if len(points) < 2:
            continue

        draw.line(
            [(point["x"], point["y"]) for point in points],
            fill=stroke.get("color", "#000000"),
            width=max(1, int(stroke.get("size", 3))),
            joint="curve",
        )

    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()
