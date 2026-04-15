import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { exportWorkspaceWithBackend } from "./api";

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportWorkspacePdf({
  name,
  strokes = [],
  textBlocks = [],
  backgroundImage = null,
  width,
  height,
}) {
  try {
    const payload = {
      workspace_name: name,
      strokes,
      text_blocks: textBlocks,
      background_image: backgroundImage,
      page_width: width,
      page_height: height,
    };
    const result = await exportWorkspaceWithBackend(payload);
    const binary = Uint8Array.from(atob(result.pdf_base64), (char) => char.charCodeAt(0));
    downloadBlob(`${name}.pdf`, new Blob([binary], { type: "application/pdf" }));
  } catch (error) {
    console.warn("Backend export unavailable, falling back to local export.", error);
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([width, height]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2 || stroke.tool !== "pen") {
        return;
      }

      stroke.points.slice(1).forEach((point, index) => {
        const previous = stroke.points[index];
        page.drawLine({
          start: { x: previous.x, y: height - previous.y },
          end: { x: point.x, y: height - point.y },
          thickness: stroke.size,
          color: hexToRgb(stroke.color),
          opacity: 0.95,
        });
      });
    });

    textBlocks.forEach((block) => {
      page.drawText(block.text, {
        x: block.x,
        y: height - block.y - block.fontSize,
        size: block.fontSize,
        font,
        color: rgb(0.13, 0.18, 0.34),
      });
    });

    const bytes = await pdfDoc.save();
    downloadBlob(`${name}.pdf`, new Blob([bytes], { type: "application/pdf" }));
  }
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const int = Number.parseInt(value, 16);
  return rgb(((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255);
}
