import { Palette, Settings2, SlidersHorizontal, Type } from "lucide-react";

function SettingsPanel({ settings, onChange, open, onToggle }) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="glass-panel absolute right-6 top-6 z-30 rounded-2xl p-3 text-slate-700 transition hover:-translate-y-0.5"
      >
        <Settings2 className="h-5 w-5" />
      </button>

      <aside
        className={`glass-panel absolute right-6 top-20 z-30 w-[290px] rounded-[28px] p-5 transition duration-300 ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="mb-5">
          <p className="font-display text-lg font-semibold text-slate-900">Workspace Settings</p>
          <p className="text-sm text-slate-500">Synced locally for all writing modes.</p>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 rounded-2xl border border-white/40 bg-white/55 p-3">
            <Type className="mt-1 h-4 w-4 text-ink-700" />
            <div className="flex-1">
              <span className="block text-sm font-semibold text-slate-700">
                Clean Text Mode
              </span>
              <span className="text-xs text-slate-500">
                Convert handwriting automatically. Turn off for Raw Ink Mode.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.cleanTextMode}
              onChange={(event) => onChange("cleanTextMode", event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/60 text-ink-700"
            />
          </label>

          <label className="block rounded-2xl border border-white/40 bg-white/55 p-3">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <SlidersHorizontal className="h-4 w-4 text-ink-700" />
              Pen Size
            </span>
            <input
              type="range"
              min="1"
              max="12"
              value={settings.penSize}
              onChange={(event) => onChange("penSize", Number(event.target.value))}
              className="w-full accent-ink-700"
            />
            <p className="mt-2 text-xs text-slate-500">{settings.penSize}px stroke weight</p>
          </label>

          <label className="block rounded-2xl border border-white/40 bg-white/55 p-3">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Palette className="h-4 w-4 text-ink-700" />
              Default Pen Color
            </span>
            <input
              type="color"
              value={settings.penColor}
              onChange={(event) => onChange("penColor", event.target.value)}
              className="h-11 w-full rounded-xl border border-white/60 bg-transparent"
            />
          </label>

          <label className="block rounded-2xl border border-white/40 bg-white/55 p-3">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Settings2 className="h-4 w-4 text-ink-700" />
              Background Style
            </span>
            <select
              value={settings.backgroundStyle}
              onChange={(event) => onChange("backgroundStyle", event.target.value)}
              className="w-full rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-sm text-slate-700 outline-none"
            >
              <option value="grid">Grid</option>
              <option value="ruled">Ruled</option>
              <option value="blank">Blank</option>
            </select>
          </label>
        </div>
      </aside>
    </>
  );
}

export default SettingsPanel;
