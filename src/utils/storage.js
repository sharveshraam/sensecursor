const SETTINGS_KEY = "sensecursor.settings";
const BOARD_KEY = "sensecursor.board";
const CANVAS_KEY = "sensecursor.canvas";
const PDF_KEY = "sensecursor.pdf";

const defaultSettings = {
  cleanTextMode: true,
  penSize: 4,
  penColor: "#1c3f95",
  backgroundStyle: "grid",
};

export function loadSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    return { ...defaultSettings, ...(parsed || {}) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadWorkspaceState(key) {
  try {
    const rawKey =
      key === "board" ? BOARD_KEY : key === "canvas" ? CANVAS_KEY : PDF_KEY;
    return JSON.parse(localStorage.getItem(rawKey) || "null");
  } catch {
    return null;
  }
}

export function saveWorkspaceState(key, value) {
  const rawKey =
    key === "board" ? BOARD_KEY : key === "canvas" ? CANVAS_KEY : PDF_KEY;
  localStorage.setItem(rawKey, JSON.stringify(value));
}

export { defaultSettings };
