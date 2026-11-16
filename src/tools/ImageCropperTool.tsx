import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { EditorToolbar } from '../components/EditorToolbar';
import { ImagePreview, PreviewMode } from '../components/ImagePreview';
import { UploadArea } from '../components/UploadArea';
import {
  useActiveToolImage,
  useEditedObjectUrl,
  useToolHistory,
} from '../hooks/useSingleImageTool';
import {
  canvasToBlob,
  downloadBlob,
  formatBytes,
  getExtensionForMime,
  loadImageFromUrl,
  stripExtension,
} from '../utils/canvasUtils';

type AspectKey = 'free' | '1:1' | '4:3' | '16:9' | '3:2' | '35:45' | 'custom';

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CropState {
  aspectKey: AspectKey;
  customW: number;
  customH: number;
  rotate90: number;
  fineAngle: number;
  crop: CropRect;
  format: 'image/png' | 'image/jpeg' | 'image/webp';
}

const ASPECT_OPTIONS: { key: AspectKey; label: string; ratio?: number }[] = [
  { key: 'free', label: 'Free' },
  { key: '1:1', label: '1:1', ratio: 1 },
  { key: '4:3', label: '4:3', ratio: 4 / 3 },
  { key: '16:9', label: '16:9', ratio: 16 / 9 },
  { key: '3:2', label: '3:2', ratio: 3 / 2 },
  { key: '35:45', label: 'Passport 35:45', ratio: 35 / 45 },
  { key: 'custom', label: 'Custom' },
];

export const ImageCropperTool: React.FC = () => {
  const { image, error, setError, handleUpload, useWorkspaceImage, clearImage } =
    useActiveToolImage();
  const { editedUrl, editedBlob, setOutput } = useEditedObjectUrl();

  const initial: CropState = {
    aspectKey: 'free',
    customW: 4,
    customH: 5,
    rotate90: 0,
    fineAngle: 0,
    crop: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
    format: 'image/jpeg',
  };

  const { current, pushState, undo, redo, resetHistory, canUndo, canRedo } =
    useToolHistory<CropState>(initial);

  const [zoom, setZoom] = useState(1);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('edited');
  const [showCroppedPreview, setShowCroppedPreview] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rotatedUrl, setRotatedUrl] = useState<string | null>(null);
  const [rotatedDim, setRotatedDim] = useState<{ w: number; h: number }>({ w: 1, h: 1 });

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    type: 'move' | 'nw' | 'ne' | 'sw' | 'se';
    startX: number;
    startY: number;
    origCrop: CropRect;
  } | null>(null);

  const [liveCrop, setLiveCrop] = useState<CropRect>(current.crop);
  useEffect(() => {
    setLiveCrop(current.crop);
  }, [current.crop]);

  useEffect(() => {
    if (!image) return;
    const fmt =
      image.mimeType === 'image/png' || image.mimeType === 'image/webp'
        ? image.mimeType
        : 'image/jpeg';
    resetHistory({
      aspectKey: 'free',
      customW: 4,
      customH: 5,
      rotate90: 0,
      fineAngle: 0,
      crop: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
      format: fmt,
    });
    setShowCroppedPreview(false);
  }, [image, resetHistory]);

  const getActiveRatio = useCallback((state: CropState): number | null => {
    if (state.aspectKey === 'free') return null;
    if (state.aspectKey === 'custom') {
      return state.customW > 0 && state.customH > 0 ? state.customW / state.customH : null;
    }
    return ASPECT_OPTIONS.find((a) => a.key === state.aspectKey)?.ratio ?? null;
  }, []);

  const applyAspectToCrop = useCallback(
    (ratio: number | null, dimW: number, dimH: number, fallbackCrop: CropRect): CropRect => {
      if (!ratio || dimW <= 0 || dimH <= 0) return fallbackCrop;
      const imgRatio = dimW / dimH;
      const normRatio = ratio / imgRatio;
      let w = 0.8;
      let h = w / normRatio;
      if (h > 0.85) {
        h = 0.85;
        w = h * normRatio;
      }
      if (w > 0.9) {
        w = 0.9;
        h = w / normRatio;
      }
      return {
        x: Math.max(0, (1 - w) / 2),
        y: Math.max(0, (1 - h) / 2),
        w,
        h,
      };
    },
    []
  );

  useEffect(() => {
    if (!image) return;
    let cancelled = false;
    let tempUrl: string | null = null;
    const buildRotated = async () => {
      try {
        const img = await loadImageFromUrl(image.objectUrl);
        const totalDeg = current.rotate90 + current.fineAngle;
        const rad = (totalDeg * Math.PI) / 180;
        const swap = current.rotate90 % 180 !== 0;
        const w = swap ? img.naturalHeight : img.naturalWidth;
        const h = swap ? img.naturalWidth : img.naturalHeight;

        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d')!;
        if (current.format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
        }
        ctx.translate(w / 2, h / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        const blob = await canvasToBlob(c, 'image/png');
        if (cancelled) return;
        tempUrl = URL.createObjectURL(blob);
        setRotatedUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return tempUrl;
        });
        setRotatedDim({ w, h });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Rotate failed.');
      }
    };
    buildRotated();
    return () => {
      cancelled = true;
    };
  }, [image, current.rotate90, current.fineAngle, current.format, setError]);

  useEffect(() => {
    return () => {
      if (rotatedUrl) URL.revokeObjectURL(rotatedUrl);
    };
  }, [rotatedUrl]);

  useEffect(() => {
    if (!rotatedUrl) return;
    let cancelled = false;
    const renderCrop = async () => {
      setProcessing(true);
      try {
        const img = await loadImageFromUrl(rotatedUrl);
        const sx = Math.max(0, Math.round(liveCrop.x * img.naturalWidth));
        const sy = Math.max(0, Math.round(liveCrop.y * img.naturalHeight));
        const sw = Math.max(1, Math.round(liveCrop.w * img.naturalWidth));
        const sh = Math.max(1, Math.round(liveCrop.h * img.naturalHeight));

        const out = document.createElement('canvas');
        out.width = sw;
        out.height = sh;
        const ctx = out.getContext('2d')!;
        if (current.format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, sw, sh);
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        const blob = await canvasToBlob(out, current.format, 0.94);
        if (!cancelled) setOutput(blob);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Crop failed.');
      } finally {
        if (!cancelled) setProcessing(false);
      }
    };
    const timer = setTimeout(renderCrop, 90);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [rotatedUrl, liveCrop, current.format, setError, setOutput]);

  const handlePointerDown = (
    e: React.PointerEvent,
    type: 'move' | 'nw' | 'ne' | 'sw' | 'se'
  ) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      origCrop: { ...liveCrop },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragRef.current.startX) / rect.width;
    const dy = (e.clientY - dragRef.current.startY) / rect.height;
    const o = dragRef.current.origCrop;
    const ratio = getActiveRatio(current);
    const imgRatio = rotatedDim.w / rotatedDim.h;
    const normRatio = ratio ? ratio / imgRatio : null;

    let next = { ...o };
    const minSize = 0.08;

    if (dragRef.current.type === 'move') {
      next.x = Math.max(0, Math.min(1 - o.w, o.x + dx));
      next.y = Math.max(0, Math.min(1 - o.h, o.y + dy));
    } else if (dragRef.current.type === 'se') {
      let w = Math.max(minSize, Math.min(1 - o.x, o.w + dx));
      let h = normRatio ? w / normRatio : Math.max(minSize, Math.min(1 - o.y, o.h + dy));
      if (o.y + h > 1) {
        h = 1 - o.y;
        if (normRatio) w = h * normRatio;
      }
      next.w = w;
      next.h = h;
    } else if (dragRef.current.type === 'nw') {
      const maxX = o.x + o.w - minSize;
      const newX = Math.max(0, Math.min(maxX, o.x + dx));
      let w = o.x + o.w - newX;
      let h = normRatio ? w / normRatio : o.h - dy;
      let newY = normRatio ? o.y + o.h - h : Math.max(0, Math.min(o.y + o.h - minSize, o.y + dy));
      if (!normRatio) h = o.y + o.h - newY;
      if (newY < 0) {
        newY = 0;
        h = o.y + o.h;
        if (normRatio) w = h * normRatio;
      }
      next = { x: o.x + o.w - w, y: newY, w, h };
    } else if (dragRef.current.type === 'ne') {
      let w = Math.max(minSize, Math.min(1 - o.x, o.w + dx));
      let h = normRatio ? w / normRatio : Math.max(minSize, o.h - dy);
      let newY = o.y + o.h - h;
      if (newY < 0) {
        newY = 0;
        h = o.y + o.h;
        if (normRatio) w = h * normRatio;
      }
      next = { x: o.x, y: newY, w, h };
    } else if (dragRef.current.type === 'sw') {
      const newX = Math.max(0, Math.min(o.x + o.w - minSize, o.x + dx));
      let w = o.x + o.w - newX;
      let h = normRatio ? w / normRatio : Math.max(minSize, Math.min(1 - o.y, o.h + dy));
      if (o.y + h > 1) {
        h = 1 - o.y;
        if (normRatio) w = h * normRatio;
      }
      next = { x: o.x + o.w - w, y: o.y, w, h };
    }

    setLiveCrop(next);
  };

  const handlePointerUp = () => {
    if (dragRef.current) {
      dragRef.current = null;
      pushState({ ...current, crop: liveCrop });
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

  const outPxW = Math.max(1, Math.round(liveCrop.w * rotatedDim.w));
  const outPxH = Math.max(1, Math.round(liveCrop.h * rotatedDim.h));

  const handleDownload = (): boolean => {
    if (!editedBlob) return false;
    const ext = getExtensionForMime(editedBlob.type);
    return downloadBlob(editedBlob, `${stripExtension(image.fileName)}-cropped.${ext}`);
  };

  return (
    <div className="space-y-4">
      <EditorToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={() => resetHistory({ ...initial, format: current.format })}
        onClearImage={clearImage}
        mode={showCroppedPreview ? previewMode : undefined}
        onModeChange={showCroppedPreview ? setPreviewMode : undefined}
        zoom={zoom}
        onZoomChange={setZoom}
        currentToolId="image-cropper"
        onSendToTool={async () => editedBlob}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Panel */}
        <div className="order-2 lg:order-1 lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ASPECT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    const nextState = { ...current, aspectKey: opt.key };
                    const ratio = getActiveRatio(nextState);
                    const nextCrop = applyAspectToCrop(
                      ratio,
                      rotatedDim.w,
                      rotatedDim.h,
                      nextState.crop
                    );
                    pushState({ ...nextState, crop: nextCrop });
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border cursor-pointer transition-colors min-h-[40px] ${
                    current.aspectKey === opt.key
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {current.aspectKey === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Ratio W</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={current.customW}
                  onChange={(e) => {
                    const cw = Math.max(1, Number(e.target.value) || 1);
                    const nextState = { ...current, customW: cw };
                    const nextCrop = applyAspectToCrop(
                      cw / current.customH,
                      rotatedDim.w,
                      rotatedDim.h,
                      nextState.crop
                    );
                    pushState({ ...nextState, crop: nextCrop });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Ratio H</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={current.customH}
                  onChange={(e) => {
                    const ch = Math.max(1, Number(e.target.value) || 1);
                    const nextState = { ...current, customH: ch };
                    const nextCrop = applyAspectToCrop(
                      current.customW / ch,
                      rotatedDim.w,
                      rotatedDim.h,
                      nextState.crop
                    );
                    pushState({ ...nextState, crop: nextCrop });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono tabular-nums"
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Crop Rotate</label>
              <button
                type="button"
                onClick={() => {
                  const nextDeg = (current.rotate90 + 90) % 360;
                  const ratio = getActiveRatio(current);
                  const swappedCrop = applyAspectToCrop(
                    ratio,
                    rotatedDim.h,
                    rotatedDim.w,
                    current.crop
                  );
                  pushState({ ...current, rotate90: nextDeg, crop: swappedCrop });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer min-h-[38px]"
              >
                <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                <span>+90°</span>
              </button>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Fine Angle</span>
                <span className="font-mono tabular-nums">{current.fineAngle}°</span>
              </div>
              <input
                type="range"
                min={-45}
                max={45}
                value={current.fineAngle}
                onChange={(e) =>
                  pushState({ ...current, fineAngle: Number(e.target.value) })
                }
                className="w-full cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Output Format
            </label>
            <select
              value={current.format}
              onChange={(e) =>
                pushState({
                  ...current,
                  format: e.target.value as CropState['format'],
                })
              }
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm min-h-[44px]"
            >
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WEBP</option>
            </select>
          </div>

          <DownloadButton
            onClick={handleDownload}
            disabled={!editedBlob}
            loading={processing}
            sublabel={editedBlob ? formatBytes(editedBlob.size) : undefined}
            className="w-full"
          />
        </div>

        {/* Crop Viewport */}
        <div className="order-1 lg:order-2 lg:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex p-1 rounded-lg bg-slate-100">
              <button
                type="button"
                onClick={() => setShowCroppedPreview(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer min-h-[36px] ${
                  !showCroppedPreview ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Crop Editor
              </button>
              <button
                type="button"
                onClick={() => setShowCroppedPreview(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer min-h-[36px] ${
                  showCroppedPreview ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Cropped Preview
              </button>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-600">
              Selection: {outPxW} × {outPxH} px
            </span>
          </div>

          {showCroppedPreview ? (
            <ImagePreview
              originalUrl={image.objectUrl}
              editedUrl={editedUrl}
              mode={previewMode}
              zoom={zoom}
              alt={image.fileName}
            />
          ) : (
            <div className="w-full min-h-[300px] max-h-[540px] rounded-xl border border-slate-200 checkerboard-bg overflow-auto flex items-center justify-center p-4">
              {rotatedUrl && (
                <div
                  ref={containerRef}
                  className="relative inline-block select-none touch-none"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  <img
                    src={rotatedUrl}
                    alt={image.fileName}
                    draggable={false}
                    className="block max-h-[440px] max-w-full w-auto pointer-events-none"
                  />

                  <div
                    className="absolute inset-0 bg-slate-950/50 pointer-events-none"
                    style={{
                      clipPath: `polygon(0% 0%, 0% 100%, ${liveCrop.x * 100}% 100%, ${liveCrop.x * 100}% ${liveCrop.y * 100}%, ${(liveCrop.x + liveCrop.w) * 100}% ${liveCrop.y * 100}%, ${(liveCrop.x + liveCrop.w) * 100}% ${(liveCrop.y + liveCrop.h) * 100}%, ${liveCrop.x * 100}% ${(liveCrop.y + liveCrop.h) * 100}%, ${liveCrop.x * 100}% 100%, 100% 100%, 100% 0%)`,
                    }}
                  />

                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'move')}
                    style={{
                      left: `${liveCrop.x * 100}%`,
                      top: `${liveCrop.y * 100}%`,
                      width: `${liveCrop.w * 100}%`,
                      height: `${liveCrop.h * 100}%`,
                    }}
                    className="absolute border-2 border-white shadow-sm cursor-move touch-none"
                  >
                    <div className="absolute inset-x-0 top-1/3 border-t border-white/40 pointer-events-none" />
                    <div className="absolute inset-x-0 top-2/3 border-t border-white/40 pointer-events-none" />
                    <div className="absolute inset-y-0 left-1/3 border-l border-white/40 pointer-events-none" />
                    <div className="absolute inset-y-0 left-2/3 border-l border-white/40 pointer-events-none" />

                    {/* 44px touch-friendly corner handles */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'nw')}
                      className="absolute -top-5 -left-5 w-10 h-10 flex items-center justify-center cursor-nwse-resize touch-none"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow" />
                    </div>
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'ne')}
                      className="absolute -top-5 -right-5 w-10 h-10 flex items-center justify-center cursor-nesw-resize touch-none"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow" />
                    </div>
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'sw')}
                      className="absolute -bottom-5 -left-5 w-10 h-10 flex items-center justify-center cursor-nesw-resize touch-none"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow" />
                    </div>
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'se')}
                      className="absolute -bottom-5 -right-5 w-10 h-10 flex items-center justify-center cursor-nwse-resize touch-none"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
