export function attachWorkspaceShortcuts({
  onToolChange,
  onUndo,
  onRedo,
  onPanStart,
  onPanEnd,
  onForceConvert,
  onOpenColor,
}) {
  function onKeyDown(event) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
      return;
    }

    if (event.key.toLowerCase() === "p") {
      onToolChange("pen");
    }
    if (event.key.toLowerCase() === "e") {
      onToolChange("eraser");
    }
    if (event.key.toLowerCase() === "c") {
      onOpenColor();
    }
    if (event.key === " " && !event.repeat) {
      event.preventDefault();
      onPanStart();
    }
    if (event.key === "Enter") {
      onForceConvert();
    }
    if (event.ctrlKey && event.key.toLowerCase() === "z" && !event.shiftKey) {
      event.preventDefault();
      onUndo();
    }
    if (
      (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "z") ||
      (event.ctrlKey && event.key.toLowerCase() === "y")
    ) {
      event.preventDefault();
      onRedo();
    }
  }

  function onKeyUp(event) {
    if (event.key === " ") {
      onPanEnd();
    }
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };
}
