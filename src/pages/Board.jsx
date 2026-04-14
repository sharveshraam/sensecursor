import { useMemo, useState } from "react";
import CanvasEngine from "../components/CanvasEngine";
import WorkspaceShell from "../components/WorkspaceShell";
import useWorkspaceController from "../hooks/useWorkspaceController";

function Board() {
  const controller = useWorkspaceController("board");
  const [status, setStatus] = useState({
    title: "Board ready",
    detail: "Write naturally, pause to auto-convert, or press Enter to force conversion.",
  });
  const layerSummary = useMemo(
    () => ({
      strokes: controller.state.strokes.length,
      text: controller.state.textBlocks.length,
    }),
    [controller.state.strokes.length, controller.state.textBlocks.length],
  );

  return (
    <WorkspaceShell
      title="Smart Board"
      subtitle="Page-based writing with ghost previews and smart conversion"
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
      <CanvasEngine
        mode="board"
        settings={controller.settings}
        state={controller.state}
        onStateChange={controller.setState}
        panEnabled={controller.panEnabled}
        convertSignal={controller.convertSignal}
        replaying={controller.replaying}
        onReplayFinished={() => controller.setReplaying(false)}
        onStatusChange={setStatus}
      />
    </WorkspaceShell>
  );
}

export default Board;
