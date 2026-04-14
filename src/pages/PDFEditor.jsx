import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import CanvasEngine from "../components/CanvasEngine";
import WorkspaceShell from "../components/WorkspaceShell";
import useWorkspaceController from "../hooks/useWorkspaceController";

function PDFEditor() {
  const controller = useWorkspaceController("pdf");
  const [pdfFile, setPdfFile] = useState(null);
  const [background, setBackground] = useState(controller.state.pdfPreview || null);

  const badge = useMemo(
    () => (pdfFile ? `${pdfFile.name} loaded` : "Upload a PDF to annotate"),
    [pdfFile],
  );

  function handlePdfUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const url = URL.createObjectURL(file);
    setPdfFile(file);
    setBackground(url);
    controller.setState((value) => ({ ...value, pdfPreview: url, pdfName: file.name }));
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
      />
    </WorkspaceShell>
  );
}

export default PDFEditor;
