from io import BytesIO

from reportlab.lib.pagesizes import portrait
from reportlab.pdfgen import canvas


def export_workspace_pdf(
    workspace_name: str,
    text_blocks: list,
    page_width: int = 1400,
    page_height: int = 900,
) -> bytes:
    """Generate a lightweight PDF from workspace text blocks."""
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=portrait((page_width, page_height)))
    pdf.setTitle(f"SenseCursor - {workspace_name}")

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
