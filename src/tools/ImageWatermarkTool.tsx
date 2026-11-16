import React, { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
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

type WatermarkPos =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'tiled';

interface WatermarkState {
  kind: 'text' | 'logo';
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number;
  position: WatermarkPos;
  logoScale: number;
  format: 'image/png' | 'image/jpeg' | 'image/webp';
}

const INITIAL_WATERMARK: WatermarkState = {
  kind: 'text',
  text: 'Fynof Studio',
  fontSize: 36,
  color: '#ffffff',
  opacity: 65,
  rotation: 0,
  position: 'bottom-right',
  logoScale: 24,
  format: 'image/jpeg',
};

const POSITIONS: { id: WatermarkPos; label: string }[] = [
  { id: 'top-left', label: '↖' },
  { id: 'top-center', label: '↑' },
  { id: 'top-right', label: '↗' },
  { id: 'center-left', label: '←' },
  { id: 'center', label: '•' },
  { id: 'center-right', label: '→' },
  { id: 'bottom-left', label: '↙' },
  { id: 'bottom-center', label: '↓' },
  { id: 'bottom-right', label: '↘' },
];

export const ImageWatermarkTool: React.FC = () => {
  const { image, error, setError, handleUpload, useWorkspaceImage, clearImage } =
    useActiveToolImage();
  const { editedUrl, editedBlob, setOutput } = useEditedObjectUrl();

  const { current, pushState, undo, redo, resetHistory, canUndo, canRedo } =
    useToolHistory<WatermarkState>(INITIAL_WATERMARK);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('edited');
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  const handleLogoFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setLogoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    pushState({ ...current, kind: 'logo' });
  };

  useEffect(() => {
    if (!image) {
      setOutput(null);
      return;
    }
    let cancelled = false;
    const render = async () => {
      setProcessing(true);
      setError(null);
      try {
        const baseImg = await loadImageFromUrl(image.objectUrl);
        const w = baseImg.naturalWidth;
        const h = baseImg.naturalHeight;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        if (current.format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(baseImg, 0, 0, w, h);

        let logoImg: HTMLImageElement | null = null;
        if (current.kind === 'logo' && logoUrl) {
          logoImg = await loadImageFromUrl(logoUrl);
        }

        const scaleFactor = Math.max(0.6, w / 900);
        const fontPx = Math.round(current.fontSize * scaleFactor);
        const pad = Math.round(28 * scaleFactor);

        ctx.save();
        ctx.globalAlpha = current.opacity / 100;

        const drawStampAt = (cx: number, cy: number) => {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((current.rotation * Math.PI) / 180);

          if (current.kind === 'text') {
            ctx.font = `700 ${fontPx}px "Plus Jakarta Sans", sans-serif`;
            ctx.fillStyle = current.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,0.25)';
            ctx.shadowBlur = Math.round(4 * scaleFactor);
            ctx.fillText(current.text || 'Watermark', 0, 0);
          } else if (logoImg) {
            const targetW = Math.max(24, (w * current.logoScale) / 100);
            const targetH = targetW * (logoImg.naturalHeight / logoImg.naturalWidth);
            ctx.drawImage(logoImg, -targetW / 2, -targetH / 2, targetW, targetH);
          }
          ctx.restore();
        };

        if (current.position === 'tiled') {
          const stepX = Math.max(160, Math.round(w / 3));
          const stepY = Math.max(140, Math.round(h / 3));
          for (let y = stepY / 2; y < h; y += stepY) {
            for (let x = stepX / 2; x < w; x += stepX) {
              drawStampAt(x, y);
            }
          }
        } else {
          let halfW = 80 * scaleFactor;
          let halfH = 24 * scaleFactor;
          if (current.kind === 'text') {
            ctx.font = `700 ${fontPx}px "Plus Jakarta Sans", sans-serif`;
            halfW = ctx.measureText(current.text || 'Watermark').width / 2;
            halfH = fontPx / 2;
          } else if (logoImg) {
            const targetW = Math.max(24, (w * current.logoScale) / 100);
            const targetH = targetW * (logoImg.naturalHeight / logoImg.naturalWidth);
            halfW = targetW / 2;
            halfH = targetH / 2;
          }

          let cx = w / 2;
          let cy = h / 2;
          if (current.position.includes('left')) cx = pad + halfW;
          if (current.position.includes('right')) cx = w - pad - halfW;
          if (current.position.includes('top')) cy = pad + halfH;
          if (current.position.includes('bottom')) cy = h - pad - halfH;

          drawStampAt(cx, cy);
        }

        ctx.restore();

        const blob = await canvasToBlob(canvas, current.format, 0.92);
        if (!cancelled) setOutput(blob);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Watermark error.');
      } finally {
        if (!cancelled) setProcessing(false);
      }
    };
    const timer = setTimeout(render, 100);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [image, current, logoUrl, setError, setOutput]);

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
    return downloadBlob(editedBlob, `${stripExtension(image.fileName)}-watermarked.${ext}`);
  };

  return (
    <div className="space-y-4">
      <EditorToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={() => resetHistory(INITIAL_WATERMARK)}
        onClearImage={clearImage}
        mode={previewMode}
        onModeChange={setPreviewMode}
        zoom={zoom}
        onZoomChange={setZoom}
        currentToolId="image-watermark"
        onSendToTool={async () => editedBlob}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="order-2 lg:order-1 lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-4">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-slate-100">
            <button
              type="button"
              onClick={() => pushState({ ...current, kind: 'text' })}
              className={`py-2 text-xs font-medium rounded-md cursor-pointer min-h-[38px] ${
                current.kind === 'text' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Text Watermark
            </button>
            <button
              type="button"
              onClick={() => pushState({ ...current, kind: 'logo' })}
              className={`py-2 text-xs font-medium rounded-md cursor-pointer min-h-[38px] ${
                current.kind === 'logo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Logo Watermark
            </button>
          </div>

          {current.kind === 'text' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={current.text}
                  onChange={(e) => pushState({ ...current, text: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Font Size ({current.fontSize}px)
                  </label>
                  <input
                    type="range"
                    min={12}
                    max={120}
                    value={current.fontSize}
                    onChange={(e) =>
                      pushState({ ...current, fontSize: Number(e.target.value) })
                    }
                    className="w-full cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={current.color}
                    onChange={(e) => pushState({ ...current, color: e.target.value })}
                    className="w-full h-9 rounded border border-slate-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleLogoFile(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs font-medium text-slate-700 hover:border-blue-500 cursor-pointer min-h-[44px]"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span>{logoUrl ? 'Change Logo Image' : 'Upload Logo (PNG/SVG)'}</span>
              </button>
              {!logoUrl && (
                <p className="text-[11px] text-slate-500">
                  Upload a transparent PNG or SVG logo to preview it over your image.
                </p>
              )}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Logo Size</span>
                  <span className="font-mono tabular-nums text-blue-600">
                    {current.logoScale}%
                  </span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={70}
                  value={current.logoScale}
                  onChange={(e) =>
                    pushState({ ...current, logoScale: Number(e.target.value) })
                  }
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-700">Opacity</span>
              <span className="font-mono tabular-nums text-blue-600">{current.opacity}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={current.opacity}
              onChange={(e) => pushState({ ...current, opacity: Number(e.target.value) })}
              className="w-full cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-700">Rotation</span>
              <span className="font-mono tabular-nums text-blue-600">{current.rotation}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              value={current.rotation}
              onChange={(e) => pushState({ ...current, rotation: Number(e.target.value) })}
              className="w-full cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Position
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {POSITIONS.map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => pushState({ ...current, position: pos.id })}
                  className={`py-2 rounded-lg text-xs font-medium border cursor-pointer min-h-[38px] ${
                    current.position === pos.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => pushState({ ...current, position: 'tiled', rotation: -30 })}
              className={`mt-2 w-full py-2 rounded-lg text-xs font-medium border cursor-pointer min-h-[38px] ${
                current.position === 'tiled'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Tiled Grid Pattern
            </button>
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
                  format: e.target.value as WatermarkState['format'],
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

        <div className="order-1 lg:order-2 lg:col-span-8">
          <ImagePreview
            originalUrl={image.objectUrl}
            editedUrl={editedUrl}
            mode={previewMode}
            zoom={zoom}
            alt={image.fileName}
          />
        </div>
      </div>
    </div>
  );
};
