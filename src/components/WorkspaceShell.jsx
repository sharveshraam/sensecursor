import { ArrowLeft, Layers3, Move, PenLine, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Toolbar from "./Toolbar";
import SettingsPanel from "./SettingsPanel";

function WorkspaceShell({
  title,
  subtitle,
  activeTool,
  settings,
  settingsOpen,
  onSettingsChange,
  onSettingsToggle,
  onToolChange,
  onUndo,
  onRedo,
  onConvert,
  onExportPdf,
  onSaveJson,
  children,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-4 text-slate-800 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-ink-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="glass-panel inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-x-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>

          <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-2 text-sm text-slate-600">
            <Sparkles className="h-4 w-4 text-ink-700" />
            <span>{subtitle}</span>
          </div>
        </div>

        <Toolbar
          title={title}
          activeTool={activeTool}
          onToolChange={onToolChange}
          onUndo={onUndo}
          onRedo={onRedo}
          onConvert={onConvert}
          onExportPdf={onExportPdf}
          onSaveJson={onSaveJson}
        />

        <div className="relative min-h-[72vh] rounded-[32px] border border-white/45 bg-white/20 p-3 shadow-glass backdrop-blur-lg">
          <SettingsPanel
            open={settingsOpen}
            onToggle={onSettingsToggle}
            settings={settings}
            onChange={onSettingsChange}
          />

          <div className="pointer-events-none absolute left-6 top-6 z-20 flex flex-col gap-3">
            <div className="glass-panel rounded-2xl px-3 py-2 text-sm text-slate-600">
              <PenLine className="mr-2 inline h-4 w-4 text-ink-700" />
              `P` pen, `E` eraser, `Enter` convert
            </div>
            <div className="glass-panel rounded-2xl px-3 py-2 text-sm text-slate-600">
              <Move className="mr-2 inline h-4 w-4 text-ink-700" />
              Hold `Space` to pan
            </div>
            <div className="glass-panel rounded-2xl px-3 py-2 text-sm text-slate-600">
              <Layers3 className="mr-2 inline h-4 w-4 text-ink-700" />
              Raw strokes stay in memory for undo and replay
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export default WorkspaceShell;
