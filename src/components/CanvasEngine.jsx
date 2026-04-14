import { useEffect, useMemo, useRef, useState } from "react";
import {
  addPointToStroke,
  cloneHistoryState,
  createStroke,
  getWordBounds,
  groupStrokesIntoWords,
  simplifyPointFromEvent,
} from "../utils/strokeUtils";

const PROCESS_DELAY = 1200;

function CanvasEngine({
  settings,
  mode = "board",
  state,
  onStateChange,
  panEnabled,
  pdfBackground,
  convertSignal = 0,
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [ghostBlock, setGhostBlock] = useState(null);
  const [transform, setTransform] = useState(
    state.transform || { x: 0, y: 0, scale: 1 },
  );
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPoint = useRef(null);
  const timeoutRef = useRef(null);

  const dimensions = useMemo(() => {
    if (mode === "canvas") {
      return { width: 2200, height: 1400 };
    }
    if (mode === "pdf") {
      return { width: 1200, height: 1600 };
    }
    return { width: 1400, height: 900 };
  }, [mode]);

  const fullState = useMemo(
    () => ({
      strokes: [],
      textBlocks: [],
      history: [],
      future: [],
      activeTool: "pen",
      transform: { x: 0, y: 0, scale: 1 },
      replay: [],
      ...state,
    }),
    [state],
  );

  useEffect(() => {
    onStateChange({ ...fullState, transform });
  }, [transform]);

  useEffect(() => {
    if (convertSignal > 0) {
      processLatestWord(fullState.strokes);
    }
  }, [convertSignal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * ratio;
    canvas.height = dimensions.height * ratio;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawScene(context);
  }, [dimensions, fullState, currentStroke, ghostBlock, settings.backgroundStyle, transform, pdfBackground]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  function drawScene(context) {
    context.clearRect(0, 0, dimensions.width, dimensions.height);
    context.save();
    context.translate(transform.x, transform.y);
    context.scale(transform.scale, transform.scale);

    drawBackground(context);
    fullState.strokes.forEach((stroke) => drawStroke(context, stroke));
    if (currentStroke) {
      drawStroke(context, currentStroke);
    }
    fullState.textBlocks.forEach((block) => drawTextBlock(context, block));
    if (ghostBlock) {
      drawGhostBlock(context, ghostBlock);
    }
    context.restore();
  }

  function drawBackground(context) {
    context.save();
    context.fillStyle = pdfBackground ? "#ffffff" : "rgba(255,255,255,0.74)";
    context.fillRect(0, 0, dimensions.width, dimensions.height);
    context.restore();

    if (settings.backgroundStyle === "blank") {
      return;
    }

    context.save();
    context.strokeStyle = "rgba(95, 125, 245, 0.12)";
    context.lineWidth = 1;

    if (settings.backgroundStyle === "grid") {
      for (let x = 0; x < dimensions.width; x += 28) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, dimensions.height);
        context.stroke();
      }
    }

    const step = settings.backgroundStyle === "ruled" ? 36 : 28;
    for (let y = 0; y < dimensions.height; y += step) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(dimensions.width, y);
      context.stroke();
    }
    context.restore();
  }

  function drawStroke(context, stroke) {
    if (!stroke.points.length) {
      return;
    }

    context.save();
    context.lineJoin = "round";
    context.lineCap = "round";
    context.strokeStyle = stroke.tool === "eraser" ? "rgba(255,255,255,0.88)" : stroke.color;
    context.lineWidth = stroke.size;
    context.beginPath();
    context.moveTo(stroke.points[0].x, stroke.points[0].y);
    stroke.points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    context.stroke();
    context.restore();
  }

  function drawTextBlock(context, block) {
    context.save();
    context.globalAlpha = block.opacity ?? 1;
    context.fillStyle = block.color || "#15213d";
    context.font = `${block.fontSize}px Manrope`;
    context.fillText(block.text, block.x, block.y + block.fontSize);
    context.restore();
  }

  function drawGhostBlock(context, block) {
    context.save();
    context.globalAlpha = 0.55;
    context.fillStyle = "#5f7df5";
    context.font = `${block.fontSize}px Manrope`;
    context.fillText(block.text, block.x, block.y + block.fontSize);
    context.restore();
  }

  function pushHistory(nextState) {
    const snapshot = cloneHistoryState({
      strokes: fullState.strokes,
      textBlocks: fullState.textBlocks,
      replay: fullState.replay,
      transform,
    });
    onStateChange({
      ...fullState,
      ...nextState,
      history: [...fullState.history, snapshot],
      future: [],
    });
  }

  function eraseIntersectingStrokes(eraserStroke) {
    const eraserBounds = getWordBounds([eraserStroke]);
    return fullState.strokes.filter((stroke) => {
      const bounds = getWordBounds([stroke]);
      const intersects =
        eraserBounds.left <= bounds.right &&
        eraserBounds.right >= bounds.left &&
        eraserBounds.top <= bounds.bottom &&
        eraserBounds.bottom >= bounds.top;
      return !intersects;
    });
  }

  function handlePointerDown(event) {
    const canvas = canvasRef.current;
    canvas.setPointerCapture(event.pointerId);

    if (panEnabled) {
      setIsPanning(true);
      lastPanPoint.current = { x: event.clientX, y: event.clientY };
      return;
    }

    const point = simplifyPointFromEvent(event.nativeEvent, transform);
    const stroke = createStroke(
      point,
      settings.penColor,
      settings.penSize,
      fullState.activeTool,
    );

    setCurrentStroke(stroke);
    setIsDrawing(true);
  }

  function handlePointerMove(event) {
    if (isPanning && lastPanPoint.current) {
      const deltaX = event.clientX - lastPanPoint.current.x;
      const deltaY = event.clientY - lastPanPoint.current.y;
      setTransform((value) => ({
        ...value,
        x: value.x + deltaX,
        y: value.y + deltaY,
      }));
      lastPanPoint.current = { x: event.clientX, y: event.clientY };
      return;
    }

    if (!isDrawing || !currentStroke) {
      return;
    }

    const point = simplifyPointFromEvent(event.nativeEvent, transform);
    setCurrentStroke((value) => addPointToStroke({ ...value, points: [...value.points] }, point));
  }

  function handlePointerUp(event) {
    const canvas = canvasRef.current;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    if (isPanning) {
      setIsPanning(false);
      lastPanPoint.current = null;
      return;
    }

    if (!currentStroke) {
      return;
    }

    const nextStrokes =
      currentStroke.tool === "eraser"
        ? eraseIntersectingStrokes(currentStroke)
        : [...fullState.strokes, currentStroke];

    pushHistory({
      strokes: nextStrokes,
      textBlocks: fullState.textBlocks,
      replay: [...fullState.replay, currentStroke],
      transform,
      activeTool: fullState.activeTool,
    });

    setCurrentStroke(null);
    setIsDrawing(false);
    scheduleWordProcessing(nextStrokes);
  }

  function scheduleWordProcessing(strokes = fullState.strokes) {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      processLatestWord(strokes);
    }, PROCESS_DELAY);
  }

  async function processLatestWord(strokes = fullState.strokes) {
    if (!settings.cleanTextMode) {
      return;
    }

    const penStrokes = strokes.filter((stroke) => stroke.tool === "pen");
    if (!penStrokes.length) {
      return;
    }

    const groups = groupStrokesIntoWords(penStrokes);
    const latestGroup = groups[groups.length - 1];
    const bounds = getWordBounds(latestGroup);
    if (!bounds) {
      return;
    }

    const preview = {
      text: "recognizing...",
      x: bounds.left,
      y: bounds.top,
      fontSize: Math.max(18, bounds.height * 0.9),
    };

    setGhostBlock(preview);

    try {
      const response = await fetch("http://127.0.0.1:8000/recognize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ strokes: latestGroup }),
      });

      const data = await response.json();
      const textBlock = {
        id: crypto.randomUUID(),
        text: data.text || "hello",
        x: bounds.left,
        y: bounds.top,
        fontSize: Math.max(18, bounds.height * 0.9),
        color: "#15213d",
        opacity: 1,
        sourceStrokeIds: latestGroup.map((stroke) => stroke.id),
      };

      const remainingStrokes = fullState.strokes.filter(
        (stroke) => !textBlock.sourceStrokeIds.includes(stroke.id),
      );

      pushHistory({
        strokes: remainingStrokes,
        textBlocks: [...fullState.textBlocks, textBlock],
        replay: fullState.replay,
        transform,
        activeTool: fullState.activeTool,
      });
    } catch (error) {
      console.error("Recognition request failed", error);
    } finally {
      window.setTimeout(() => setGhostBlock(null), 250);
    }
  }

  function handleWheel(event) {
    if (mode !== "canvas") {
      return;
    }

    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.08 : -0.08;
    setTransform((value) => ({
      ...value,
      scale: Math.min(2.5, Math.max(0.45, Number((value.scale + delta).toFixed(2)))),
    }));
  }

  return (
    <div className="relative h-full min-h-[72vh] overflow-auto rounded-[26px]">
      <div className={`relative rounded-[26px] ${mode === "canvas" ? "min-w-[2200px]" : ""}`}>
        {pdfBackground ? (
          <iframe
            src={pdfBackground}
            title="Uploaded PDF"
            className="pointer-events-none absolute inset-0 h-full w-full rounded-[24px] border-0"
          />
        ) : null}

        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="relative z-10 touch-none rounded-[24px]"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
        />
      </div>
    </div>
  );
}

export default CanvasEngine;
