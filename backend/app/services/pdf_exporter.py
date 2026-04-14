from io import BytesIO
from base64 import b64decode

from reportlab.lib.pagesizes import portrait
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


def export_workspace_pdf(
    workspace_name: str,
    strokes: list,
    text_blocks: list,
    background_image: str | None = None,
    page_width: int = 1400,
    page_height: int = 900,
) -> bytes:
    """Generate a lightweight PDF from text, strokes, and optional page imagery."""
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=portrait((page_width, page_height)))
    pdf.setTitle(f"SenseCursor - {workspace_name}")

    if background_image:
        image_bytes = decode_data_url(background_image)
        if image_bytes:
            pdf.drawImage(
                ImageReader(BytesIO(image_bytes)),
                0,
                0,
                width=page_width,
                height=page_height,
                preserveAspectRatio=True,
                mask="auto",
            )

    for stroke in strokes:
        if stroke.get("tool") != "pen":
            continue

        points = stroke.get("points", [])
        if len(points) < 2:
            continue

        pdf.setStrokeColor(to_reportlab_color(stroke.get("color", "#1c3f95")))
        pdf.setLineWidth(max(1, int(stroke.get("size", 3))))

        for index in range(1, len(points)):
            previous = points[index - 1]
            current = points[index]
            pdf.line(
                previous["x"],
                page_height - previous["y"],
                current["x"],
                page_height - current["y"],
            )

    for block in text_blocks:
        font_size = max(10, int(block.get("fontSize", 18)))
        pdf.setFont("Helvetica", font_size)
        pdf.drawString(
            block.get("x", 80),
            page_height - block.get("y", 120) - font_size,
            block.get("text", ""),
        )

    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return buffer.read()


def decode_data_url(data_url: str) -> bytes | None:
    if "," not in data_url:
        return None
    _, encoded = data_url.split(",", 1)
    return b64decode(encoded)


def to_reportlab_color(hex_color: str):
    from reportlab.lib.colors import Color

    value = hex_color.replace("#", "")
    if len(value) == 3:
        value = "".join(char * 2 for char in value)

    red = int(value[0:2], 16) / 255
    green = int(value[2:4], 16) / 255
    blue = int(value[4:6], 16) / 255
    return Color(red, green, blue, alpha=0.95)
