import { useEffect, useMemo, useRef, useState } from "react";
import { attachWorkspaceShortcuts } from "../utils/keyboard";
import {
  defaultSettings,
  loadSettings,
  loadWorkspaceState,
  saveSettings,
  saveWorkspaceState,
} from "../utils/storage";
import { downloadJson, exportWorkspacePdf } from "../utils/exporters";

function useWorkspaceController(workspaceKey) {
  const [settings, setSettings] = useState(() => loadSettings() || defaultSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panEnabled, setPanEnabled] = useState(false);
  const [convertSignal, setConvertSignal] = useState(0);
  const [state, setState] = useState(
    () =>
      loadWorkspaceState(workspaceKey) || {
        strokes: [],
        textBlocks: [],
        history: [],
        future: [],
        replay: [],
        activeTool: "pen",
        transform: { x: 0, y: 0, scale: 1 },
      },
  );
  const colorInputRef = useRef(null);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveWorkspaceState(workspaceKey, state);
  }, [workspaceKey, state]);

  function undo() {
    setState((current) => {
      if (!current.history.length) {
        return current;
      }

      const previous = current.history[current.history.length - 1];
      return {
        ...current,
        ...previous,
        history: current.history.slice(0, -1),
        future: [current, ...current.future],
      };
    });
  }

  function redo() {
    setState((current) => {
      if (!current.future.length) {
        return current;
      }

      const [next, ...rest] = current.future;
      return {
        ...current,
        ...next,
        history: [...current.history, current],
        future: rest,
      };
    });
  }

  useEffect(() => {
    return attachWorkspaceShortcuts({
      onToolChange: (tool) => setState((value) => ({ ...value, activeTool: tool })),
      onUndo: undo,
      onRedo: redo,
      onPanStart: () => setPanEnabled(true),
      onPanEnd: () => setPanEnabled(false),
      onForceConvert: () => setConvertSignal((value) => value + 1),
      onOpenColor: () => colorInputRef.current?.click(),
    });
  }, [workspaceKey]);

  function updateSettings(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function handleExportPdf() {
    await exportWorkspacePdf({
      name: workspaceKey,
      textBlocks: state.textBlocks,
      width: workspaceKey === "canvas" ? 2200 : 1400,
      height: workspaceKey === "pdf" ? 1600 : 900,
    });
  }

  function handleSaveJson() {
    downloadJson(`${workspaceKey}.json`, {
      settings,
      workspace: workspaceKey,
      ...state,
    });
  }

  return useMemo(
    () => ({
      settings,
      settingsOpen,
      panEnabled,
      convertSignal,
      state,
      colorInputRef,
      setState,
      setSettingsOpen,
      setPanEnabled,
      setConvertSignal,
      updateSettings,
      undo,
      redo,
      handleExportPdf,
      handleSaveJson,
    }),
    [settings, settingsOpen, panEnabled, convertSignal, state],
  );
}

export default useWorkspaceController;
