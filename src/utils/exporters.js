import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

export async function exportWorkspacePdf({ name, textBlocks, width, height }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([width, height]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

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
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
