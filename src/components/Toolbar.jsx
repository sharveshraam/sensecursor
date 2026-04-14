import {
  Eraser,
  FileOutput,
  Highlighter,
  Redo2,
  Save,
  Undo2,
  WandSparkles,
} from "lucide-react";

const toolButtonClass =
  "rounded-2xl border border-white/50 bg-white/65 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white";

function Toolbar({
  title,
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  onConvert,
  onExportPdf,
  onSaveJson,
}) {
  return (
    <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] px-5 py-4">
      <div>
        <p className="font-display text-lg font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">
          Write naturally, then refine, export, or convert in place.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`${toolButtonClass} ${activeTool === "pen" ? "bg-ink-100 text-ink-900" : ""}`}
          onClick={() => onToolChange("pen")}
        >
          <Highlighter className="mr-2 inline h-4 w-4" />
          Pen
        </button>
        <button
          type="button"
          className={`${toolButtonClass} ${activeTool === "eraser" ? "bg-ink-100 text-ink-900" : ""}`}
          onClick={() => onToolChange("eraser")}
        >
          <Eraser className="mr-2 inline h-4 w-4" />
          Eraser
        </button>
        <button type="button" className={toolButtonClass} onClick={onUndo}>
          <Undo2 className="mr-2 inline h-4 w-4" />
          Undo
        </button>
        <button type="button" className={toolButtonClass} onClick={onRedo}>
          <Redo2 className="mr-2 inline h-4 w-4" />
          Redo
        </button>
        <button type="button" className={toolButtonClass} onClick={onConvert}>
          <WandSparkles className="mr-2 inline h-4 w-4" />
          Convert
        </button>
        <button type="button" className={toolButtonClass} onClick={onSaveJson}>
          <Save className="mr-2 inline h-4 w-4" />
          JSON
        </button>
        <button type="button" className={toolButtonClass} onClick={onExportPdf}>
          <FileOutput className="mr-2 inline h-4 w-4" />
          PDF
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
