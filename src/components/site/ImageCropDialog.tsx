import { useEffect, useRef, useState } from "react";
import { X, RotateCw, RefreshCcw, Maximize2, Minimize2 } from "lucide-react";

type Props = { file: File; onCancel: () => void; onComplete: (file: File) => void };

/** Local, dependency-free fixed 4:5 cropper. Output is strictly 1200x1500 WebP. */
export function ImageCropDialog({ file, onCancel, onComplete }: Props) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [baseScale, setBaseScale] = useState(1);
  const [url, setUrl] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const source = useRef<HTMLImageElement>(null);

  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });
  const initialPinchDist = useRef<number | null>(null);
  const initialPinchZoom = useRef<number>(1);

  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  const calculateMinScale = (img: HTMLImageElement, container: HTMLDivElement, rot: number) => {
    const isRotated = rot % 180 !== 0;
    const w = isRotated ? img.naturalHeight : img.naturalWidth;
    const h = isRotated ? img.naturalWidth : img.naturalHeight;
    if (!w || !h) return 1;
    // Cover scale: minimum scale required to completely fill 4:5 container without empty space
    return Math.max(container.clientWidth / w, container.clientHeight / h);
  };

  const clampOffset = (newOffset: { x: number; y: number }, currentZoom: number, rot: number) => {
    const img = source.current;
    const container = containerRef.current;
    if (!img || !container) return newOffset;

    const isRotated = rot % 180 !== 0;
    const w = isRotated ? img.naturalHeight : img.naturalWidth;
    const h = isRotated ? img.naturalWidth : img.naturalHeight;
    if (!w || !h) return newOffset;

    const minScale = calculateMinScale(img, container, rot);
    const effectiveScale = minScale * currentZoom;
    const renderedW = w * effectiveScale;
    const renderedH = h * effectiveScale;

    const maxX = Math.max(0, (renderedW - container.clientWidth) / 2);
    const maxY = Math.max(0, (renderedH - container.clientHeight) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, newOffset.x)),
      y: Math.max(-maxY, Math.min(maxY, newOffset.y)),
    };
  };

  const onImageLoad = () => {
    const img = source.current;
    const container = containerRef.current;
    if (!img || !container) return;
    const scale = calculateMinScale(img, container, rotation);
    setBaseScale(scale);
    setOffset(clampOffset({ x: 0, y: 0 }, zoom, rotation));
  };

  useEffect(() => {
    const img = source.current;
    const container = containerRef.current;
    if (img && container) {
      const scale = calculateMinScale(img, container, rotation);
      setBaseScale(scale);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [rotation, url]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { ...offset };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    const rawOffset = { x: startOffset.current.x + dx, y: startOffset.current.y + dy };
    setOffset(clampOffset(rawOffset, zoom, rotation));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.92 : 1.08;
    const newZoom = Math.max(1, Math.min(4, zoom * scaleFactor));
    setZoom(newZoom);
    setOffset((prev) => clampOffset(prev, newZoom, rotation));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDist.current = dist;
      initialPinchZoom.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && initialPinchDist.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / initialPinchDist.current;
      const newZoom = Math.max(1, Math.min(4, initialPinchZoom.current * scale));
      setZoom(newZoom);
      setOffset((prev) => clampOffset(prev, newZoom, rotation));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      initialPinchDist.current = null;
    }
  };

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
  };

  const setFill = () => {
    setZoom(1.25);
    setOffset({ x: 0, y: 0 });
  };

  const setFit = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  function save() {
    const image = source.current;
    const container = containerRef.current;
    if (!image || !container) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasScale = canvas.width / container.clientWidth;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.translate(offset.x * canvasScale, offset.y * canvasScale);
    ctx.rotate((rotation * Math.PI) / 180);

    const finalScale = baseScale * zoom * canvasScale;
    ctx.scale(finalScale, finalScale);

    ctx.drawImage(
      image,
      -image.naturalWidth / 2,
      -image.naturalHeight / 2,
      image.naturalWidth,
      image.naturalHeight
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onComplete(
            new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, {
              type: "image/webp",
            })
          );
        }
      },
      "image/webp",
      0.86
    );
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/80 p-4 select-none">
      <div className="w-full max-w-lg bg-background p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Product Image Crop</p>
            <h2 className="font-display text-2xl">Fixed 4:5 Crop Frame</h2>
          </div>
          <button aria-label="Cancel" onClick={onCancel} className="p-2 hover:bg-muted rounded-full">
            <X className="size-5" />
          </button>
        </div>

        <div className="text-xs text-muted-foreground mt-1">
          Drag to pan, pinch/wheel to zoom. Image is constrained to fill the frame completely.
        </div>

        <div
          ref={containerRef}
          className="relative mx-auto mt-4 aspect-[4/5] max-h-[50vh] overflow-hidden bg-muted cursor-move select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <img
            ref={source}
            src={url}
            alt="Crop preview"
            onLoad={onImageLoad}
            className="absolute top-1/2 left-1/2 origin-center pointer-events-none"
            style={{
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom * baseScale}) rotate(${rotation}deg)`,
              maxWidth: "none",
            }}
          />

          {/* Dotted 4:5 overlay with vignette mask */}
          <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-gold/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] flex flex-col justify-between p-2">
            <div className="flex justify-between text-[0.6rem] uppercase tracking-wider text-gold font-bold bg-black/40 px-2 py-0.5 self-start">
              4:5 Product Frame
            </div>
            <div className="grid grid-cols-3 grid-rows-3 inset-0 absolute pointer-events-none border border-white/10">
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-white/10" />
              <div className="border-r border-white/10" />
              <div />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={setFit}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium border ${zoom === 1 ? "border-gold bg-gold/15 text-foreground" : "border-border bg-muted/50"}`}
            >
              <Minimize2 className="size-3.5" />
              Fit
            </button>
            <button
              type="button"
              onClick={setFill}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium border ${zoom > 1 ? "border-gold bg-gold/15 text-foreground" : "border-border bg-muted/50"}`}
            >
              <Maximize2 className="size-3.5" />
              Fill
            </button>
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setRotation((r) => r + 90)}
              className="flex items-center gap-1 border border-border bg-muted/50 px-3 py-1.5 text-xs hover:bg-muted"
            >
              <RotateCw className="size-3.5" />
              Rotate
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1 border border-border bg-muted/50 px-3 py-1.5 text-xs hover:bg-muted"
            >
              <RefreshCcw className="size-3.5" />
              Reset
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          className="mt-5 w-full bg-foreground px-5 py-3 text-[.7rem] uppercase tracking-[.16em] text-background hover:bg-foreground/90 transition-colors"
        >
          Use cropped WebP (1200×1500)
        </button>
      </div>
    </div>
  );
}

