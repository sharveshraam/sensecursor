import { useEffect, useMemo, useRef, useState } from "react";
import {
  addPointToStroke,
  cloneHistoryState,
  createStroke,
  getWordBounds,
  groupStrokesIntoWords,
  simplifyPointFromEvent,
} from "../utils/strokeUtils";
import { recognizeWord } from "../utils/api";

const PROCESS_DELAY = 1200;
const TEXT_FADE_MS = 260;
const REPLAY_INTERVAL_MS = 110;

function CanvasEngine({
  settings,
  mode = "board",
  state,
  onStateChange,
  panEnabled,
  pdfBackground,
  convertSignal = 0,
  replaying = false,
  onReplayFinished,
  onStatusChange,
}) {
  const canvasRef = useRef(null);
  const timeoutRef = useRef(null);
  const replayTimerRef = useRef(null);
  const lastPanPoint = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [ghostBlock, setGhostBlock] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [animationClock, setAnimationClock] = useState(Date.now());
  const [transform, setTransform] = useState(
    state.transform || { x: 0, y: 0, scale: 1 },
  );
  const [replayProgress, setReplayProgress] = useState(0);

  const dimensions = useMemo(() => {
    if (mode === "canvas") {
      return {
        width: state.pageWidth || 2200,
        height: state.pageHeight || 1400,
      };
    }
    if (mode === "pdf") {
      return {
        width: state.pageWidth || 1240,
        height: state.pageHeight || 1600,
      };
    }
    return {
      width: state.pageWidth || 1440,
      height: state.pageHeight || 920,
    };
  }, [mode, state.pageHeight, state.pageWidth]);

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

  const visibleStrokes = useMemo(() => {
    if (!replaying) {
      return fullState.strokes;
    }
    const ids = new Set(fullState.replay.slice(0, replayProgress).map((stroke) => stroke.id));
    return fullState.replay.filter((stroke) => ids.has(stroke.id));
  }, [fullState.replay, fullState.strokes, replayProgress, replaying]);

  const visibleTextBlocks = useMemo(() => {
    const now = animationClock;
    const textBlocks = replaying
      ? fullState.textBlocks.filter((block) => {
          const latestSourceIndex = Math.max(
            ...block.sourceStrokeIds.map((id) =>
              fullState.replay.findIndex((stroke) => stroke.id === id),
            ),
          );
          return latestSourceIndex >= 0 && latestSourceIndex < replayProgress;
        })
      : fullState.textBlocks;

    return textBlocks.map((block) => {
      if (!block.createdAt) {
        return { ...block, opacity: block.opacity ?? 1 };
      }
      const elapsed = Math.max(0, now - block.createdAt);
      const alpha = Math.min(1, elapsed / TEXT_FADE_MS);
      return { ...block, opacity: alpha };
    });
  }, [animationClock, fullState.replay, fullState.textBlocks, replayProgress, replaying]);

  useEffect(() => {
    onStateChange({ ...fullState, transform });
  }, [transform]);

  useEffect(() => {
    if (convertSignal > 0) {
      processLatestWord(fullState.strokes);
    }
  }, [convertSignal]);

  useEffect(() => {
    const hasAnimatedText = fullState.textBlocks.some(
      (block) => block.createdAt && Date.now() - block.createdAt < TEXT_FADE_MS,
    );
    if (!hasAnimatedText && !replaying && !ghostBlock) {
      return undefined;
    }

    const timer = window.setTimeout(() => setAnimationClock(Date.now()), 16);
    return () => window.clearTimeout(timer);
  }, [animationClock, fullState.textBlocks, replaying, ghostBlock]);

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
  }, [
    animationClock,
    currentStroke,
    dimensions,
    ghostBlock,
    pdfBackground,
    settings.backgroundStyle,
    transform,
    visibleStrokes,
    visibleTextBlocks,
  ]);

  useEffect(() => {
    if (!replaying) {
      window.clearInterval(replayTimerRef.current);
      setReplayProgress(0);
      return;
    }

    setReplayProgress(0);
    onStatusChange?.({
      title: "Replay running",
      detail: "Playing back captured strokes and text layer timing.",
    });

    replayTimerRef.current = window.setInterval(() => {
      setReplayProgress((value) => {
        const next = value + 1;
        if (next > fullState.replay.length) {
          window.clearInterval(replayTimerRef.current);
          onReplayFinished?.();
          onStatusChange?.({
            title: "Replay complete",
            detail: "Stroke history is available for undo, replay, and future collaboration hooks.",
          });
          return fullState.replay.length;
        }
        return next;
      });
    }, REPLAY_INTERVAL_MS);

    return () => window.clearInterval(replayTimerRef.current);
  }, [fullState.replay, onReplayFinished, onStatusChange, replaying]);

  useEffect(() => () => {
    window.clearTimeout(timeoutRef.current);
    window.clearInterval(replayTimerRef.current);
  }, []);

  function drawScene(context) {
    context.clearRect(0, 0, dimensions.width, dimensions.height);
    context.save();
    context.translate(transform.x, transform.y);
    context.scale(transform.scale, transform.scale);

    drawBackground(context);
    visibleStrokes.forEach((stroke) => drawStroke(context, stroke));
    if (currentStroke && !replaying) {
      drawStroke(context, currentStroke);
    }
    visibleTextBlocks.forEach((block) => drawTextBlock(context, block));
    if (ghostBlock && !replaying) {
      drawGhostBlock(context, ghostBlock);
    }
    context.restore();
  }

  function drawBackground(context) {
    context.save();
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, dimensions.width, dimensions.height);
    context.restore();

    if (pdfBackground) {
      return;
    }

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
    context.globalAlpha = 0.58;
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
    const remainingStrokes = fullState.strokes.filter((stroke) => {
      const bounds = getWordBounds([stroke]);
      const intersects =
        eraserBounds.left <= bounds.right &&
        eraserBounds.right >= bounds.left &&
        eraserBounds.top <= bounds.bottom &&
        eraserBounds.bottom >= bounds.top;
      return !intersects;
    });

    const remainingTextBlocks = fullState.textBlocks.filter((block) => {
      const right = block.x + block.text.length * (block.fontSize * 0.58);
      const bottom = block.y + block.fontSize;
      const intersects =
        eraserBounds.left <= right &&
        eraserBounds.right >= block.x &&
        eraserBounds.top <= bottom &&
        eraserBounds.bottom >= block.y;
      return !intersects;
    });

    return { remainingStrokes, remainingTextBlocks };
  }

  function handlePointerDown(event) {
    if (replaying) {
      return;
    }

    const canvas = canvasRef.current;
    canvas.setPointerCapture(event.pointerId);

    if (panEnabled) {
      setIsPanning(true);
      lastPanPoint.current = { x: event.clientX, y: event.clientY };
      onStatusChange?.({
        title: "Pan mode active",
        detail: "Drag to move around the workspace. Release Space to return to writing.",
      });
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
    onStatusChange?.({
      title: fullState.activeTool === "eraser" ? "Erasing layer" : "Capturing ink",
      detail: "Pointer events are being recorded with position and timestamp metadata.",
    });
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
      onStatusChange?.({
        title: "Pan complete",
        detail: "Workspace position updated. You can continue writing or zooming.",
      });
      return;
    }

    if (!currentStroke) {
      return;
    }

    let nextStrokes = fullState.strokes;
    let nextTextBlocks = fullState.textBlocks;

    if (currentStroke.tool === "eraser") {
      const erased = eraseIntersectingStrokes(currentStroke);
      nextStrokes = erased.remainingStrokes;
      nextTextBlocks = erased.remainingTextBlocks;
    } else {
      nextStrokes = [...fullState.strokes, currentStroke];
    }

    pushHistory({
      strokes: nextStrokes,
      textBlocks: nextTextBlocks,
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

    onStatusChange?.({
      title: "Awaiting conversion",
      detail: "Stroke gap and timeout heuristics are watching for the end of the current word.",
    });
  }

  async function processLatestWord(strokes = fullState.strokes) {
    if (!settings.cleanTextMode) {
      onStatusChange?.({
        title: "Raw Ink Mode",
        detail: "Clean text conversion is off, so handwriting remains untouched on the canvas.",
      });
      return;
    }

    const penStrokes = strokes.filter((stroke) => stroke.tool === "pen");
    if (!penStrokes.length) {
      return;
    }

    const groups = groupStrokesIntoWords(penStrokes);
    const latestGroup = groups[groups.length - 1];
    const alreadyConverted = fullState.textBlocks.some((block) =>
      latestGroup.every((stroke) => block.sourceStrokeIds?.includes(stroke.id)),
    );
    if (alreadyConverted) {
      return;
    }

    const bounds = getWordBounds(latestGroup);
    if (!bounds) {
      return;
    }

    setGhostBlock({
      text: "recognizing...",
      x: bounds.left,
      y: bounds.top,
      fontSize: Math.max(18, bounds.height * 0.9),
    });
    onStatusChange?.({
      title: "Recognizing handwriting",
      detail: "Sending the latest grouped stroke cluster to the FastAPI recognition endpoint.",
    });

    try {
      const data = await recognizeWord(latestGroup);
      const textBlock = {
        id: crypto.randomUUID(),
        text: data.text || "hello",
        x: data.bounding_box?.left ?? bounds.left,
        y: data.bounding_box?.top ?? bounds.top,
        fontSize: Math.max(18, (data.bounding_box?.height ?? bounds.height) * 0.9),
        color: "#15213d",
        createdAt: Date.now(),
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

      onStatusChange?.({
        title: "Text layer created",
        detail: `Converted the latest word into "${textBlock.text}" while preserving placement and scale.`,
      });
    } catch (error) {
      console.error("Recognition request failed", error);
      onStatusChange?.({
        title: "Backend unavailable",
        detail: "Recognition could not complete, so the raw ink stays visible and editable.",
      });
    } finally {
      window.setTimeout(() => setGhostBlock(null), 220);
    }
  }

  function handleWheel(event) {
    if (mode !== "canvas" && mode !== "pdf") {
      return;
    }

    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.08 : -0.08;
    setTransform((value) => ({
      ...value,
      scale: Math.min(2.5, Math.max(0.45, Number((value.scale + delta).toFixed(2)))),
    }));

    onStatusChange?.({
      title: "Zoom adjusted",
      detail: `Workspace zoom is now ${Math.round(
        Math.min(2.5, Math.max(0.45, (transform.scale + delta))) * 100,
      )}%.`,
    });
  }

  return (
    <div className="relative h-full min-h-[72vh] overflow-auto rounded-[26px]">
      <div className={`relative rounded-[26px] ${mode === "canvas" ? "min-w-[2200px]" : ""}`}>
        {pdfBackground ? (
          <img
            src={pdfBackground}
            alt="PDF page preview"
            className="pointer-events-none absolute inset-0 h-full w-full rounded-[24px] object-contain"
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
