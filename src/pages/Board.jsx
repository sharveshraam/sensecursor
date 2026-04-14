import CanvasEngine from "../components/CanvasEngine";
import WorkspaceShell from "../components/WorkspaceShell";
import useWorkspaceController from "../hooks/useWorkspaceController";

function Board() {
  const controller = useWorkspaceController("board");

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
      />
    </WorkspaceShell>
  );
}

export default Board;
