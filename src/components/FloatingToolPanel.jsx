import { Layers3, Palette, PenLine, Play, Square, Type } from "lucide-react";

const swatches = ["#1c3f95", "#0f766e", "#b45309", "#9d174d", "#111827"];

function FloatingToolPanel({
  activeTool,
  onToolChange,
  penColor,
  onColorChange,
  replaying,
  onReplayToggle,
  layerSummary,
  conversionMode,
}) {
  return (
    <aside className="glass-panel absolute bottom-6 left-6 z-30 w-[280px] rounded-[28px] p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold text-slate-900">Quick Tools</p>
          <p className="text-xs text-slate-500">Switch tools, colors, layers, and replay.</p>
        </div>
        <div className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-700">
          {conversionMode}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
            activeTool === "pen"
              ? "border-ink-200 bg-ink-100 text-ink-900"
              : "border-white/50 bg-white/60 text-slate-700 hover:bg-white"
          }`}
          onClick={() => onToolChange("pen")}
        >
          <PenLine className="mr-2 inline h-4 w-4" />
          Pen
        </button>
        <button
          type="button"
          className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
            activeTool === "eraser"
              ? "border-ink-200 bg-ink-100 text-ink-900"
              : "border-white/50 bg-white/60 text-slate-700 hover:bg-white"
          }`}
          onClick={() => onToolChange("eraser")}
        >
          <Type className="mr-2 inline h-4 w-4" />
          Erase
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-white/40 bg-white/55 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Palette className="h-4 w-4 text-ink-700" />
          Ink Palette
        </div>
        <div className="flex flex-wrap gap-2">
          {swatches.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Use ${swatch} ink`}
              onClick={() => onColorChange(swatch)}
              className={`h-8 w-8 rounded-full border-2 transition hover:scale-105 ${
                penColor === swatch ? "border-slate-900" : "border-white/70"
              }`}
              style={{ backgroundColor: swatch }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/40 bg-white/55 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Layers3 className="h-4 w-4 text-ink-700" />
            Layers
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Ink: {layerSummary.strokes}
            <br />
            Text: {layerSummary.text}
          </p>
        </div>

        <button
          type="button"
          onClick={onReplayToggle}
          className="rounded-2xl border border-white/40 bg-white/55 p-3 text-left transition hover:bg-white/80"
        >
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            {replaying ? (
              <Square className="h-4 w-4 text-ink-700" />
            ) : (
              <Play className="h-4 w-4 text-ink-700" />
            )}
            Replay
          </div>
          <p className="text-xs leading-5 text-slate-500">
            {replaying ? "Stop live stroke playback." : "Rewatch the captured writing history."}
          </p>
        </button>
      </div>
    </aside>
  );
}

export default FloatingToolPanel;
