import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Brush, Grid3X3, SquareDashed, UserCheck } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { EditorToolbar } from '../components/EditorToolbar';
import { ImagePreview, PreviewMode } from '../components/ImagePreview';
import { UploadArea } from '../components/UploadArea';
import { useActiveToolImage, useEditedObjectUrl } from '../hooks/useSingleImageTool';
import {
  applyPixelateRect,
  canvasToBlob,
  createCanvasFromImage,
  downloadBlob,
  formatBytes,
  getExtensionForMime,
  loadImageFromUrl,
  stripExtension,
} from '../utils/canvasUtils';

type BlurToolMode = 'brush' | 'face' | 'box';
type BlurEffect = 'blur' | 'pixelate';

export const ImageBlurTool: React.FC = () => {
  const { image, error, setError, handleUpload, useWorkspaceImage, clearImage } =
    useActiveToolImage();
  const { editedUrl, editedBlob, setOutput } = useEditedObjectUrl();

  const [toolMode, setToolMode] = useState<BlurToolMode>('brush');
  const [effect, setEffect] = useState<BlurEffect>('blur');
  const [brushSize, setBrushSize] = useState(44);
  const [intensity, setIntensity] = useState(14);
  const [zoom, setZoom] = useState(1);
  const [viewTab, setViewTab] = useState<'paint' | 'compare'>('paint');
  const [compareMode, setCompareMode] = useState<PreviewMode>('compare');
  const [processing, setProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const blurredSourceRef = useRef<HTMLCanvasElement | null>(null);
  const snapshotsRef = useRef<ImageData[]>([]);
  const snapIdxRef = useRef(-1);
  const [historyMeta, setHistoryMeta] = useState({ idx: -1, len: 0 });

  const isDrawingRef = useRef(false);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);
  const boxStartRef = useRef<{ x: number; y: number } | null>(null);
  const [boxOverlay, setBoxOverlay] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const syncBlob = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) return;
    setProcessing(true);
    try {
      const mime = image?.mimeType === 'image/png' ? 'image/png' : 'image/jpeg';
      const blob = await canvasToBlob(c, mime, 0.92);
      setOutput(blob);
    } finally {
      setProcessing(false);
    }
  }, [image?.mimeType, setOutput]);

  const rebuildBlurredSource = useCallback(() => {
    const orig = originalCanvasRef.current;
    if (!orig) return;
    const b = document.createElement('canvas');
    b.width = orig.width;
    b.height = orig.height;
    const bCtx = b.getContext('2d')!;
    bCtx.filter = `blur(${Math.max(2, intensity)}px)`;
    bCtx.drawImage(orig, 0, 0);
    bCtx.filter = 'none';
    blurredSourceRef.current = b;
  }, [intensity]);

  useEffect(() => {
    rebuildBlurredSource();
  }, [rebuildBlurredSource]);

  useEffect(() => {
    if (!image) {
      setOutput(null);
      return;
    }
    let cancelled = false;
    const init = async () => {
      setError(null);
      try {
        const img = await loadImageFromUrl(image.objectUrl);
        if (cancelled) return;
        const base = createCanvasFromImage(img);
        originalCanvasRef.current = base;

        const c = canvasRef.current;
        if (!c) return;
        c.width = base.width;
        c.height = base.height;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(base, 0, 0);

        const initialSnap = ctx.getImageData(0, 0, c.width, c.height);
        snapshotsRef.current = [initialSnap];
        snapIdxRef.current = 0;
        setHistoryMeta({ idx: 0, len: 1 });
        rebuildBlurredSource();
        await syncBlob();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load image.');
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [image, rebuildBlurredSource, setError, setOutput, syncBlob]);

  const pushSnapshot = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const snap = ctx.getImageData(0, 0, c.width, c.height);
    const nextList = snapshotsRef.current.slice(0, snapIdxRef.current + 1);
    nextList.push(snap);
    // Keep memory lean on 4GB Android phones
    if (nextList.length > 15) nextList.shift();
    snapshotsRef.current = nextList;
    snapIdxRef.current = nextList.length - 1;
    setHistoryMeta({ idx: snapIdxRef.current, len: nextList.length });
    syncBlob();
  };

  const handleUndo = () => {
    if (snapIdxRef.current <= 0 || !canvasRef.current) return;
    snapIdxRef.current -= 1;
    const ctx = canvasRef.current.getContext('2d')!;
    ctx.putImageData(snapshotsRef.current[snapIdxRef.current], 0, 0);
    setHistoryMeta({ idx: snapIdxRef.current, len: snapshotsRef.current.length });
    syncBlob();
  };

  const handleRedo = () => {
    if (snapIdxRef.current >= snapshotsRef.current.length - 1 || !canvasRef.current) return;
    snapIdxRef.current += 1;
    const ctx = canvasRef.current.getContext('2d')!;
    ctx.putImageData(snapshotsRef.current[snapIdxRef.current], 0, 0);
    setHistoryMeta({ idx: snapIdxRef.current, len: snapshotsRef.current.length });
    syncBlob();
  };

  const handleReset = () => {
    if (!canvasRef.current || snapshotsRef.current.length === 0) return;
    const ctx = canvasRef.current.getContext('2d')!;
    ctx.putImageData(snapshotsRef.current[0], 0, 0);
    snapshotsRef.current = [snapshotsRef.current[0]];
    snapIdxRef.current = 0;
    setHistoryMeta({ idx: 0, len: 1 });
    syncBlob();
  };

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * c.width,
      y: ((e.clientY - rect.top) / rect.height) * c.height,
      normX: (e.clientX - rect.left) / rect.width,
      normY: (e.clientY - rect.top) / rect.height,
    };
  };

  const paintSpot = (cx: number, cy: number) => {
    const c = canvasRef.current;
    const blurred = blurredSourceRef.current;
    if (!c || !blurred) return;
    const ctx = c.getContext('2d')!;
    const scale = Math.max(1, c.width / 800);
    const radius = ((toolMode === 'face' ? brushSize * 1.4 : brushSize) * scale) / 2;

    if (effect === 'pixelate') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      applyPixelateRect(
        ctx,
        cx - radius,
        cy - radius,
        radius * 2,
        radius * 2,
        Math.max(8, Math.round(intensity * scale))
      );
      ctx.restore();
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(blurred, 0, 0);
      ctx.restore();
    }
    return radius;
  };

  const paintStroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const c = canvasRef.current;
    if (!c) return;
    const scale = Math.max(1, c.width / 800);
    const radius = ((toolMode === 'face' ? brushSize * 1.4 : brushSize) * scale) / 2;
    const step = Math.max(4, radius * 0.35);
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(dist / step));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      paintSpot(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    canvasRef.current.setPointerCapture(e.pointerId);
    const pt = getCanvasCoords(e);
    isDrawingRef.current = true;
    lastPtRef.current = { x: pt.x, y: pt.y };

    if (toolMode === 'box') {
      boxStartRef.current = { x: pt.x, y: pt.y };
      setBoxOverlay({ x: pt.normX, y: pt.normY, w: 0, h: 0 });
    } else {
      paintSpot(pt.x, pt.y);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const pt = getCanvasCoords(e);
    if (toolMode === 'box' && boxStartRef.current) {
      const sx = boxStartRef.current.x / canvasRef.current.width;
      const sy = boxStartRef.current.y / canvasRef.current.height;
      setBoxOverlay({
        x: Math.min(sx, pt.normX),
        y: Math.min(sy, pt.normY),
        w: Math.abs(pt.normX - sx),
        h: Math.abs(pt.normY - sy),
      });
    } else {
      const prev = lastPtRef.current || { x: pt.x, y: pt.y };
      paintStroke(prev, { x: pt.x, y: pt.y });
      lastPtRef.current = { x: pt.x, y: pt.y };
    }
  };

  const onPointerUp = () => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    isDrawingRef.current = false;
    lastPtRef.current = null;

    if (toolMode === 'box' && boxOverlay && blurredSourceRef.current) {
      const c = canvasRef.current;
      const ctx = c.getContext('2d')!;
      const rx = boxOverlay.x * c.width;
      const ry = boxOverlay.y * c.height;
      const rw = boxOverlay.w * c.width;
      const rh = boxOverlay.h * c.height;
      if (rw > 4 && rh > 4) {
        if (effect === 'pixelate') {
          const scale = Math.max(1, c.width / 800);
          applyPixelateRect(ctx, rx, ry, rw, rh, Math.max(8, Math.round(intensity * scale)));
        } else {
          ctx.drawImage(blurredSourceRef.current, rx, ry, rw, rh, rx, ry, rw, rh);
        }
        pushSnapshot();
      }
      boxStartRef.current = null;
      setBoxOverlay(null);
    } else {
      pushSnapshot();
    }
  };

  if (!image) {
    return (
      <UploadArea
        accept="image/jpeg,image/png,image/webp"
        onFilesSelected={handleUpload}
        errorMessage={error}
        allowWorkspaceReuse
        onUseWorkspaceImage={useWorkspaceImage}
      />
    );
  }

  const handleDownload = (): boolean => {
    if (!editedBlob) return false;
    const ext = getExtensionForMime(editedBlob.type);
    return downloadBlob(editedBlob, `${stripExtension(image.fileName)}-blurred.${ext}`);
  };

  return (
    <div className="space-y-4">
      <EditorToolbar
        canUndo={historyMeta.idx > 0}
        canRedo={historyMeta.idx < historyMeta.len - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        onClearImage={clearImage}
        mode={viewTab === 'compare' ? compareMode : undefined}
        onModeChange={viewTab === 'compare' ? setCompareMode : undefined}
        zoom={zoom}
        onZoomChange={setZoom}
        currentToolId="image-blur-tool"
        onSendToTool={async () => editedBlob}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="order-2 lg:order-1 lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Selection Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setToolMode('brush')}
                className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-xs font-medium cursor-pointer min-h-[48px] ${
                  toolMode === 'brush'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Brush className="w-4 h-4" />
                <span>Brush</span>
              </button>
              <button
                type="button"
                onClick={() => setToolMode('face')}
                className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-xs font-medium cursor-pointer min-h-[48px] ${
                  toolMode === 'face'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Face Blur</span>
              </button>
              <button
                type="button"
                onClick={() => setToolMode('box')}
                className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-xs font-medium cursor-pointer min-h-[48px] ${
                  toolMode === 'box'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <SquareDashed className="w-4 h-4" />
                <span>Box Area</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Effect Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEffect('blur')}
                className={`py-2.5 px-3 rounded-lg border text-xs font-medium cursor-pointer min-h-[42px] ${
                  effect === 'blur'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                Smooth Blur
              </button>
              <button
                type="button"
                onClick={() => setEffect('pixelate')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border text-xs font-medium cursor-pointer min-h-[42px] ${
                  effect === 'pixelate'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Pixelate</span>
              </button>
            </div>
          </div>

          {toolMode !== 'box' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Brush Size</span>
                <span className="font-mono tabular-nums text-blue-600">{brushSize} px</span>
              </div>
              <input
                type="range"
                min={12}
                max={140}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>
          )}

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Blur / Pixelate Intensity</span>
              <span className="font-mono tabular-nums text-blue-600">{intensity}</span>
            </div>
            <input
              type="range"
              min={4}
              max={40}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <DownloadButton
            onClick={handleDownload}
            disabled={!editedBlob}
            loading={processing}
            sublabel={editedBlob ? formatBytes(editedBlob.size) : undefined}
            className="w-full"
          />
        </div>

        <div className="order-1 lg:order-2 lg:col-span-8 space-y-3">
          <div className="inline-flex p-1 rounded-lg bg-slate-100">
            <button
              type="button"
              onClick={() => setViewTab('paint')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer min-h-[36px] ${
                viewTab === 'paint' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Blur Canvas
            </button>
            <button
              type="button"
              onClick={() => setViewTab('compare')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer min-h-[36px] ${
                viewTab === 'compare' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Before / After Compare
            </button>
          </div>

          <div className={viewTab === 'paint' ? 'block' : 'hidden'}>
            <div className="w-full min-h-[300px] max-h-[540px] rounded-xl border border-slate-200 checkerboard-bg overflow-auto flex items-center justify-center p-4">
              <div
                className="relative inline-block"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              >
                <canvas
                  ref={canvasRef}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  className="block max-h-[450px] max-w-full w-auto h-auto touch-none cursor-crosshair rounded-md"
                />
                {boxOverlay && (
                  <div
                    style={{
                      left: `${boxOverlay.x * 100}%`,
                      top: `${boxOverlay.y * 100}%`,
                      width: `${boxOverlay.w * 100}%`,
                      height: `${boxOverlay.h * 100}%`,
                    }}
                    className="absolute border-2 border-blue-600 bg-blue-500/20 pointer-events-none"
                  />
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {toolMode === 'box'
                ? 'Drag a rectangle over the area you want to obscure.'
                : 'Paint smoothly over faces, text, or private regions.'}
            </p>
          </div>

          {viewTab === 'compare' && (
            <ImagePreview
              originalUrl={image.objectUrl}
              editedUrl={editedUrl}
              mode={compareMode}
              zoom={zoom}
              alt={image.fileName}
            />
          )}
        </div>
      </div>
    </div>
  );
};
