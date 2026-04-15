function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `stroke-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createStroke(point, color, size, tool = "pen") {
  return {
    id: createId(),
    tool,
    color,
    size,
    points: [point],
    startedAt: point.timestamp,
    endedAt: point.timestamp,
  };
}

export function addPointToStroke(stroke, point) {
  stroke.points.push(point);
  stroke.endedAt = point.timestamp;
  return stroke;
}

export function getStrokeBounds(stroke) {
  const xs = stroke.points.map((point) => point.x);
  const ys = stroke.points.map((point) => point.y);

  return {
    left: Math.min(...xs),
    top: Math.min(...ys),
    right: Math.max(...xs),
    bottom: Math.max(...ys),
    width: Math.max(1, Math.max(...xs) - Math.min(...xs)),
    height: Math.max(1, Math.max(...ys) - Math.min(...ys)),
  };
}

export function getWordBounds(strokes) {
  if (!strokes.length) {
    return null;
  }

  const bounds = strokes.map(getStrokeBounds);
  return {
    left: Math.min(...bounds.map((item) => item.left)),
    top: Math.min(...bounds.map((item) => item.top)),
    right: Math.max(...bounds.map((item) => item.right)),
    bottom: Math.max(...bounds.map((item) => item.bottom)),
    width:
      Math.max(...bounds.map((item) => item.right)) -
      Math.min(...bounds.map((item) => item.left)),
    height:
      Math.max(...bounds.map((item) => item.bottom)) -
      Math.min(...bounds.map((item) => item.top)),
  };
}

export function distanceBetweenBounds(a, b) {
  return Math.max(0, b.left - a.right);
}

export function groupStrokesIntoWords(strokes) {
  if (!strokes.length) {
    return [];
  }

  const sorted = [...strokes].sort((a, b) => a.startedAt - b.startedAt);
  const groups = [];
  let currentGroup = [sorted[0]];

  for (let index = 1; index < sorted.length; index += 1) {
    const stroke = sorted[index];
    const previous = currentGroup[currentGroup.length - 1];
    const previousBounds = getStrokeBounds(previous);
    const currentBounds = getStrokeBounds(stroke);
    const avgHeight = (previousBounds.height + currentBounds.height) / 2;
    const threshold = avgHeight * 1.5;
    const distance = distanceBetweenBounds(previousBounds, currentBounds);

    if (distance <= threshold) {
      currentGroup.push(stroke);
    } else {
      groups.push(currentGroup);
      currentGroup = [stroke];
    }
  }

  groups.push(currentGroup);
  return groups;
}

export function simplifyPointFromEvent(event, transform = { x: 0, y: 0, scale: 1 }) {
  return {
    x: (event.offsetX - transform.x) / transform.scale,
    y: (event.offsetY - transform.y) / transform.scale,
    timestamp: Date.now(),
  };
}

export function cloneHistoryState(state) {
  return JSON.parse(JSON.stringify(state));
}
