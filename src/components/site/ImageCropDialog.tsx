import { useEffect, useRef, useState } from "react";
import { X, RotateCw, RefreshCcw } from "lucide-react";

type Props = { file: File; onCancel: () => void; onComplete: (file: File) => void };

/** Local, dependency-free 4:5 cropper. Output is always an optimized WebP. */
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

  const onImageLoad = () => {
    const img = source.current;
    const container = containerRef.current;
    if (!img || !container) return;
    const isRotated = rotation % 180 !== 0;
    const w = isRotated ? img.naturalHeight : img.naturalWidth;
    const h = isRotated ? img.naturalWidth : img.naturalHeight;
    const scale = Math.max(container.clientWidth / w, container.clientHeight / h);
    setBaseScale(scale);
  };

  useEffect(() => {
    onImageLoad();
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
    setOffset({ x: startOffset.current.x + dx, y: startOffset.current.y + dy });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.1, Math.min(5, z * scaleFactor)));
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
      setZoom(Math.max(0.1, Math.min(5, initialPinchZoom.current * scale)));
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
    <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/80 p-4">
      <div className="w-full max-w-lg bg-background p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Image crop</p>
            <h2 className="font-display text-2xl">Set the 4:5 frame</h2>
          </div>
          <button aria-label="Cancel" onClick={onCancel} className="p-2 hover:bg-muted rounded-full">
            <X className="size-5" />
          </button>
        </div>

        <div className="text-sm text-muted-foreground mt-2">
          Drag to move, pinch or scroll to zoom.
        </div>

        <div
          ref={containerRef}
          className="relative mx-auto mt-4 aspect-[4/5] max-h-[52vh] overflow-hidden bg-muted cursor-move select-none touch-none border-2 border-dashed border-foreground/20"
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
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setRotation((r) => r + 90)}
              className="flex items-center gap-2 rounded bg-muted px-3 py-2 text-sm hover:bg-muted/80"
            >
              <RotateCw className="size-4" />
              Rotate
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded bg-muted px-3 py-2 text-sm hover:bg-muted/80"
            >
              <RefreshCcw className="size-4" />
              Reset
            </button>
          </div>
        </div>

        <button
          onClick={save}
          className="mt-6 w-full bg-foreground px-5 py-3 text-[.7rem] uppercase tracking-[.16em] text-background hover:bg-foreground/90 transition-colors"
        >
          Use cropped WebP
        </button>
      </div>
    </div>
  );
}
