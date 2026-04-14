import CanvasEngine from "../components/CanvasEngine";
import WorkspaceShell from "../components/WorkspaceShell";
import useWorkspaceController from "../hooks/useWorkspaceController";

function InfiniteCanvas() {
  const controller = useWorkspaceController("canvas");

  return (
    <WorkspaceShell
      title="Infinite Canvas"
      subtitle="Zoom, pan, and expand your thought space without breaking flow"
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
      <CanvasEngine
        mode="canvas"
        settings={controller.settings}
        state={controller.state}
        onStateChange={controller.setState}
        panEnabled={controller.panEnabled}
        convertSignal={controller.convertSignal}
      />
    </WorkspaceShell>
  );
}

export default InfiniteCanvas;
