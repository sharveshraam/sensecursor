import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import CanvasEngine from "../components/CanvasEngine";
import WorkspaceShell from "../components/WorkspaceShell";
import useWorkspaceController from "../hooks/useWorkspaceController";
import { renderPdfFirstPage } from "../utils/pdfPreview";

function PDFEditor() {
  const controller = useWorkspaceController("pdf");
  const [pdfFile, setPdfFile] = useState(null);
  const [background, setBackground] = useState(controller.state.pdfPreview || null);
  const [status, setStatus] = useState({
    title: "PDF editor ready",
    detail: "Load a document, annotate over the rendered preview, and export a polished review copy.",
  });
  const layerSummary = useMemo(
    () => ({
      strokes: controller.state.strokes.length,
      text: controller.state.textBlocks.length,
    }),
    [controller.state.strokes.length, controller.state.textBlocks.length],
  );

  const badge = useMemo(
    () => (pdfFile ? `${pdfFile.name} loaded` : "Upload a PDF to annotate"),
    [pdfFile],
  );

  async function handlePdfUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setStatus({
      title: "Rendering PDF preview",
      detail: "Preparing the first page as a live annotation surface.",
    });

    try {
      const preview = await renderPdfFirstPage(file);
      setPdfFile(file);
      setBackground(preview.preview);
      controller.setState((value) => ({
        ...value,
        pdfPreview: preview.preview,
        pdfName: file.name,
        pageWidth: Math.round(preview.width),
        pageHeight: Math.round(preview.height),
        pdfPages: preview.pages,
      }));
      setStatus({
        title: "PDF loaded",
        detail: `Rendered page 1 of ${preview.pages}. You can now annotate and convert handwriting on top.`,
      });
    } catch (error) {
      console.error("PDF preview failed", error);
      setStatus({
        title: "Preview failed",
        detail: "The PDF could not be rendered, so the annotation surface stayed unchanged.",
      });
    }
  }

  return (
    <WorkspaceShell
      title="PDF Editor"
      subtitle={badge}
      activeTool={controller.state.activeTool}
      settings={controller.settings}
      settingsOpen={controller.settingsOpen}
      onSettingsChange={controller.updateSettings}
      onSettingsToggle={() => controller.setSettingsOpen((value) => !value)}
      onToolChange={(tool) => controller.setState((value) => ({ ...value, activeTool: tool }))}
      onUndo={controller.undo}
      onRedo={controller.redo}
      onConvert={() => controller.setConvertSignal((value) => value + 1)}
      onExportPdf={controller.handleExportPdf}
      onSaveJson={controller.handleSaveJson}
      onPenColorChange={(color) => controller.updateSettings("penColor", color)}
      replaying={controller.replaying}
      onReplayToggle={() => controller.setReplaying((value) => !value)}
      layerSummary={layerSummary}
      conversionMode={controller.settings.cleanTextMode ? "Clean Text" : "Raw Ink"}
      status={status}
    >
      <input
        ref={controller.colorInputRef}
        type="color"
        value={controller.settings.penColor}
        onChange={(event) => controller.updateSettings("penColor", event.target.value)}
        className="absolute left-[-9999px]"
      />

      <label className="glass-panel absolute bottom-6 left-6 z-30 inline-flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5">
        <Upload className="h-4 w-4 text-ink-700" />
        Upload PDF
        <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
      </label>

      <CanvasEngine
        mode="pdf"
        settings={controller.settings}
        state={controller.state}
        onStateChange={controller.setState}
        panEnabled={controller.panEnabled}
        pdfBackground={background}
        convertSignal={controller.convertSignal}
        replaying={controller.replaying}
        onReplayFinished={() => controller.setReplaying(false)}
        onStatusChange={setStatus}
      />
    </WorkspaceShell>
  );
}

export default PDFEditor;
