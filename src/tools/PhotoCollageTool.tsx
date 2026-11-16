import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, Plus, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { UploadArea } from '../components/UploadArea';
import { useEditedObjectUrl } from '../hooks/useSingleImageTool';
import {
  canvasToBlob,
  downloadBlob,
  formatBytes,
  getExtensionForMime,
  loadImageFromUrl,
  validateImageFile,
} from '../utils/canvasUtils';

interface CollagePhoto {
  id: string;
  objectUrl: string;
  name: string;
}

type LayoutCount = 2 | 4 | 6 | 9;
type LayoutStyle = 'grid' | 'stacked';

export const PhotoCollageTool: React.FC = () => {
  const [photos, setPhotos] = useState<CollagePhoto[]>([]);
  const [layoutCount, setLayoutCount] = useState<LayoutCount>(4);
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('grid');
  const [borderSize, setBorderSize] = useState(14);
  const [borderColor, setBorderColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#f1f5f9');
  const [radius, setRadius] = useState(12);
  const [canvasW, setCanvasW] = useState(1200);
  const [canvasH, setCanvasH] = useState(1200);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const { editedUrl, editedBlob, setOutput } = useEditedObjectUrl();
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.objectUrl));
    };
  }, []);

  const addFiles = (files: File[]) => {
    setError(null);
    const valid = files.filter((f) => !validateImageFile(f));
    if (valid.length === 0) {
      setError('Please choose valid JPG, PNG, or WEBP image files under 60 MB.');
      return;
    }
    const added: CollagePhoto[] = valid.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      objectUrl: URL.createObjectURL(f),
      name: f.name,
    }));
    setPhotos((prev) => {
      const next = [...prev, ...added];
      if (prev.length === 0) {
        if (next.length <= 2) setLayoutCount(2);
        else if (next.length <= 4) setLayoutCount(4);
        else if (next.length <= 6) setLayoutCount(6);
        else setLayoutCount(9);
      }
      return next;
    });
  };

  const handleReplacePhoto = (file: File | undefined) => {
    if (!file || replaceIndex === null) return;
    const err = validateImageFile(file);
    if (err) {
      setError(err);
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    setPhotos((prev) =>
      prev.map((item, idx) => {
        if (idx !== replaceIndex) return item;
        URL.revokeObjectURL(item.objectUrl);
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          objectUrl: nextUrl,
          name: file.name,
        };
      })
    );
    setReplaceIndex(null);
  };

  const swapPhotos = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    setPhotos((prev) => {
      if (from >= prev.length || to >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[from];
      copy[from] = copy[to];
      copy[to] = temp;
      return copy;
    });
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => {
      const target = prev[idx];
      if (target) URL.revokeObjectURL(target.objectUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const resetSettings = () => {
    setLayoutStyle('grid');
    setBorderSize(14);
    setBorderColor('#ffffff');
    setBgColor('#f1f5f9');
    setRadius(12);
    setCanvasW(1200);
    setCanvasH(1200);
  };

  useEffect(() => {
    if (photos.length === 0) {
      setOutput(null);
      return;
    }
    let cancelled = false;
    const render = async () => {
      setProcessing(true);
      setError(null);
      try {
        const w = Math.max(300, Math.min(4000, canvasW));
        const h = Math.max(300, Math.min(4000, canvasH));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);

        let cols = layoutCount === 2 ? 2 : layoutCount === 4 ? 2 : 3;
        let rows = layoutCount === 2 ? 1 : layoutCount === 4 ? 2 : layoutCount === 6 ? 2 : 3;
        if (layoutStyle === 'stacked') {
          if (layoutCount === 2) {
            cols = 1;
            rows = 2;
          } else if (layoutCount === 4) {
            cols = 4;
            rows = 1;
          } else if (layoutCount === 6) {
            cols = 2;
            rows = 3;
          }
        }

        const gap = borderSize;
        const cellW = (w - gap * (cols + 1)) / cols;
        const cellH = (h - gap * (rows + 1)) / rows;

        for (let idx = 0; idx < layoutCount; idx++) {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const x = gap + col * (cellW + gap);
          const y = gap + row * (cellH + gap);

          ctx.save();
          drawRoundedRectPath(ctx, x, y, cellW, cellH, radius);
          ctx.fillStyle = borderColor;
          ctx.fill();
          ctx.clip();

          const photo = photos[idx];
          if (photo) {
            const img = await loadImageFromUrl(photo.objectUrl);
            if (cancelled) return;
            const imgRatio = img.naturalWidth / img.naturalHeight;
            const cellRatio = cellW / cellH;
            let dw = cellW;
            let dh = cellH;
            if (imgRatio > cellRatio) {
              dh = cellH;
              dw = dh * imgRatio;
            } else {
              dw = cellW;
              dh = dw / imgRatio;
            }
            const dx = x + (cellW - dw) / 2;
            const dy = y + (cellH - dh) / 2;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, dx, dy, dw, dh);
          } else {
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(x, y, cellW, cellH);
          }
          ctx.restore();
        }

        const blob = await canvasToBlob(canvas, format, 0.92);
        if (!cancelled) setOutput(blob);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Collage render failed.');
      } finally {
        if (!cancelled) setProcessing(false);
      }
    };
    const timer = setTimeout(render, 100);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    photos,
    layoutCount,
    layoutStyle,
    borderSize,
    borderColor,
    bgColor,
    radius,
    canvasW,
    canvasH,
    format,
    setOutput,
  ]);

  if (photos.length === 0) {
    return (
      <UploadArea
        accept="image/jpeg,image/png,image/webp"
        multiple
        onFilesSelected={addFiles}
        supportedText="Upload 2, 4, 6, or 9 photos to create a collage"
        errorMessage={error}
      />
    );
  }

  const handleDownload = (): boolean => {
    if (!editedBlob) return false;
    const ext = getExtensionForMime(format);
    return downloadBlob(editedBlob, `fynof-collage-${layoutCount}photos.${ext}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Controls Panel */}
      <div className="order-2 lg:order-1 lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Photo Layout</span>
          <button
            type="button"
            onClick={resetSettings}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {([2, 4, 6, 9] as LayoutCount[]).map((cnt) => (
            <button
              key={cnt}
              type="button"
              onClick={() => setLayoutCount(cnt)}
              className={`py-2 rounded-lg border text-xs font-mono font-semibold cursor-pointer min-h-[40px] ${
                layoutCount === cnt
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cnt}
            </button>
          ))}
        </div>

        {layoutCount !== 9 && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLayoutStyle('grid')}
              className={`py-2 rounded-lg border text-xs font-medium cursor-pointer min-h-[38px] ${
                layoutStyle === 'grid'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              Standard Grid
            </button>
            <button
              type="button"
              onClick={() => setLayoutStyle('stacked')}
              className={`py-2 rounded-lg border text-xs font-medium cursor-pointer min-h-[38px] ${
                layoutStyle === 'stacked'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              Alt Layout
            </button>
          </div>
        )}

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Border Size</span>
            <span className="font-mono tabular-nums text-blue-600">{borderSize} px</span>
          </div>
          <input
            type="range"
            min={0}
            max={48}
            value={borderSize}
            onChange={(e) => setBorderSize(Number(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Rounded Corners</span>
            <span className="font-mono tabular-nums text-blue-600">{radius} px</span>
          </div>
          <input
            type="range"
            min={0}
            max={48}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Background Color
            </label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-9 rounded border border-slate-200 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Border Color
            </label>
            <input
              type="color"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="w-full h-9 rounded border border-slate-200 cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700">
            Custom Canvas Size (px)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={300}
              max={4000}
              value={canvasW}
              onChange={(e) => setCanvasW(Number(e.target.value) || 1200)}
              aria-label="Canvas width"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono tabular-nums"
            />
            <input
              type="number"
              min={300}
              max={4000}
              value={canvasH}
              onChange={(e) => setCanvasH(Number(e.target.value) || 1200)}
              aria-label="Canvas height"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono tabular-nums"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '1200×1200', w: 1200, h: 1200 },
              { label: '1080×1350', w: 1080, h: 1350 },
              { label: '1920×1080', w: 1920, h: 1080 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setCanvasW(p.w);
                  setCanvasH(p.h);
                }}
                className="px-2 py-1 rounded border border-slate-200 text-[11px] font-mono text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormat('image/jpeg')}
              className={`py-2 rounded-lg border text-xs font-semibold cursor-pointer min-h-[40px] ${
                format === 'image/jpeg'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              JPG
            </button>
            <button
              type="button"
              onClick={() => setFormat('image/png')}
              className={`py-2 rounded-lg border text-xs font-semibold cursor-pointer min-h-[40px] ${
                format === 'image/png'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              PNG
            </button>
          </div>
        </div>

        <DownloadButton
          onClick={handleDownload}
          disabled={!editedBlob}
          loading={processing}
          label={`Download ${format === 'image/jpeg' ? 'JPG' : 'PNG'}`}
          sublabel={editedBlob ? formatBytes(editedBlob.size) : undefined}
          className="w-full"
        />
      </div>

      {/* Preview & Tile Manager */}
      <div className="order-1 lg:order-2 lg:col-span-8 space-y-4">
        <div className="w-full min-h-[300px] rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center p-4">
          {editedUrl && (
            <img
              src={editedUrl}
              alt="Collage preview"
              className="max-h-[480px] max-w-full w-auto rounded shadow-xs"
            />
          )}
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Drag & Drop to swap, or click Replace on any photo
            </span>
            <div className="flex items-center gap-2">
              <input
                ref={addInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(Array.from(e.target.files));
                  e.target.value = '';
                }}
              />
              <input
                ref={replaceInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  handleReplacePhoto(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => addInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 hover:bg-slate-100 cursor-pointer min-h-[38px]"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Add Photos</span>
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => setDragIndex(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) swapPhotos(dragIndex, idx);
                  setDragIndex(null);
                }}
                className="relative rounded-lg bg-white border border-slate-200 p-1.5 cursor-move hover:border-blue-500"
              >
                <img
                  src={photo.objectUrl}
                  alt={photo.name}
                  className="w-full h-16 object-cover rounded"
                />
                <div className="mt-1.5 flex items-center justify-between gap-1 text-[10px] font-mono text-slate-500">
                  <span>#{idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setReplaceIndex(idx);
                        replaceInputRef.current?.click();
                      }}
                      title="Replace photo"
                      aria-label={`Replace photo ${idx + 1}`}
                      className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                    {idx < photos.length - 1 && (
                      <button
                        type="button"
                        onClick={() => swapPhotos(idx, idx + 1)}
                        title="Swap with next"
                        aria-label={`Swap photo ${idx + 1}`}
                        className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer"
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      title="Remove"
                      aria-label={`Remove photo ${idx + 1}`}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}
