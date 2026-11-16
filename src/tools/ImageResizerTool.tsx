import React, { useEffect, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
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
  resizeCanvasHighQuality,
  stripExtension,
} from '../utils/canvasUtils';

interface ResizerState {
  unit: 'px' | 'percent';
  width: number;
  height: number;
  percent: number;
  lockAspect: boolean;
  format: 'image/jpeg' | 'image/png' | 'image/webp';
}

const RESIZE_PRESETS = [
  { label: '300×300', w: 300, h: 300 },
  { label: '600×600', w: 600, h: 600 },
  { label: '1080×1080', w: 1080, h: 1080 },
  { label: 'Facebook Cover', w: 820, h: 312 },
  { label: 'YouTube Thumbnail', w: 1280, h: 720 },
  { label: 'Instagram Post', w: 1080, h: 1080 },
  { label: 'WhatsApp Profile', w: 500, h: 500 },
];

export const ImageResizerTool: React.FC = () => {
  const { image, error, setError, handleUpload, useWorkspaceImage, clearImage } =
    useActiveToolImage();
  const { editedUrl, editedBlob, setOutput } = useEditedObjectUrl();

  const { current, pushState, undo, redo, resetHistory, canUndo, canRedo } =
    useToolHistory<ResizerState>({
      unit: 'px',
      width: 800,
      height: 600,
      percent: 100,
      lockAspect: true,
      format: 'image/jpeg',
    });

  const [widthInput, setWidthInput] = useState('800');
  const [heightInput, setHeightInput] = useState('600');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('edited');
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!image) return;
    const fmt =
      image.mimeType === 'image/png' || image.mimeType === 'image/webp'
        ? image.mimeType
        : 'image/jpeg';
    resetHistory({
      unit: 'px',
      width: image.width,
      height: image.height,
      percent: 100,
      lockAspect: true,
      format: fmt,
    });
    setWidthInput(String(image.width));
    setHeightInput(String(image.height));
  }, [image, resetHistory]);

  useEffect(() => {
    setWidthInput(String(current.width));
    setHeightInput(String(current.height));
  }, [current.width, current.height]);

  const targetW =
    current.unit === 'percent' && image
      ? Math.max(1, Math.round((image.width * current.percent) / 100))
      : Math.round(current.width);
  const targetH =
    current.unit === 'percent' && image
      ? Math.max(1, Math.round((image.height * current.percent) / 100))
      : Math.round(current.height);

  const dimsValid =
    targetW >= 1 && targetW <= 6000 && targetH >= 1 && targetH <= 6000;

  useEffect(() => {
    if (!image) {
      setOutput(null);
      return;
    }
    if (!dimsValid) {
      setError('Invalid dimensions. Width and height must be between 1 and 6000 pixels.');
      return;
    }

    let cancelled = false;
    const run = async () => {
      setProcessing(true);
      setError(null);
      try {
        const img = await loadImageFromUrl(image.objectUrl);
        const safeW = Math.min(4096, Math.max(1, targetW));
        const safeH = Math.min(4096, Math.max(1, targetH));
        const resized = resizeCanvasHighQuality(
          img,
          safeW,
          safeH,
          current.format === 'image/jpeg' ? '#ffffff' : undefined
        );
        const blob = await canvasToBlob(resized, current.format, 0.92);
        if (!cancelled) setOutput(blob);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Resize failed.');
        }
      } finally {
        if (!cancelled) setProcessing(false);
      }
    };
    const timer = setTimeout(run, 140);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [image, targetW, targetH, dimsValid, current.format, setError, setOutput]);

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

  const aspect = image.width / image.height;

  const handleWidthText = (val: string) => {
    setWidthInput(val);
    const num = Number(val);
    if (val === '' || !Number.isFinite(num)) return;
    const h = current.lockAspect ? Math.max(1, Math.round(num / aspect)) : current.height;
    pushState({ ...current, unit: 'px', width: num, height: h });
  };

  const handleHeightText = (val: string) => {
    setHeightInput(val);
    const num = Number(val);
    if (val === '' || !Number.isFinite(num)) return;
    const w = current.lockAspect ? Math.max(1, Math.round(num * aspect)) : current.width;
    pushState({ ...current, unit: 'px', width: w, height: num });
  };

  const handleReset = () => {
    resetHistory({
      unit: 'px',
      width: image.width,
      height: image.height,
      percent: 100,
      lockAspect: true,
      format: current.format,
    });
  };

  const handleDownload = (): boolean => {
    if (!editedBlob || !dimsValid) return false;
    const ext = getExtensionForMime(editedBlob.type);
    return downloadBlob(
      editedBlob,
      `${stripExtension(image.fileName)}-${targetW}x${targetH}.${ext}`
    );
  };

  return (
    <div className="space-y-4">
      <EditorToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={handleReset}
        onClearImage={clearImage}
        mode={previewMode}
        onModeChange={setPreviewMode}
        zoom={zoom}
        onZoomChange={setZoom}
        currentToolId="image-resizer"
        onSendToTool={async () => editedBlob}
      />

      {error && (
        <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Panel */}
        <div className="order-2 lg:order-1 lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Resize Mode
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-slate-100">
              <button
                type="button"
                onClick={() =>
                  pushState({
                    ...current,
                    unit: 'px',
                    width: targetW,
                    height: targetH,
                  })
                }
                className={`py-2 text-xs font-medium rounded-md cursor-pointer min-h-[38px] ${
                  current.unit === 'px'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Pixels (px)
              </button>
              <button
                type="button"
                onClick={() => pushState({ ...current, unit: 'percent' })}
                className={`py-2 text-xs font-medium rounded-md cursor-pointer min-h-[38px] ${
                  current.unit === 'percent'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Percentage (%)
              </button>
            </div>
          </div>

          {current.unit === 'px' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6000}
                    value={widthInput}
                    onChange={(e) => handleWidthText(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6000}
                    value={heightInput}
                    onChange={(e) => handleHeightText(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  pushState({ ...current, lockAspect: !current.lockAspect })
                }
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors min-h-[42px] ${
                  current.lockAspect
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {current.lockAspect ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <Unlock className="w-3.5 h-3.5" />
                )}
                <span>Maintain Aspect Ratio</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-700">Scale Percentage</span>
                <span className="font-mono tabular-nums font-semibold text-blue-600">
                  {current.percent}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={200}
                value={current.percent}
                onChange={(e) =>
                  pushState({ ...current, percent: Number(e.target.value) })
                }
                className="w-full cursor-pointer"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Quick & Social Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RESIZE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    pushState({
                      ...current,
                      unit: 'px',
                      width: preset.w,
                      height: preset.h,
                      lockAspect: false,
                    })
                  }
                  className="text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer min-h-[44px]"
                >
                  <div className="text-xs font-medium text-slate-800 truncate">
                    {preset.label}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                    {preset.w}×{preset.h}
                  </div>
                </button>
              ))}
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
                  format: e.target.value as ResizerState['format'],
                })
              }
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
            >
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WEBP</option>
            </select>
          </div>

          <DownloadButton
            onClick={handleDownload}
            disabled={!editedBlob || !dimsValid}
            loading={processing}
            sublabel={editedBlob ? formatBytes(editedBlob.size) : undefined}
            className="w-full"
          />
        </div>

        {/* Preview Viewport */}
        <div className="order-1 lg:order-2 lg:col-span-8 space-y-3">
          <ImagePreview
            originalUrl={image.objectUrl}
            editedUrl={editedUrl}
            mode={previewMode}
            zoom={zoom}
            alt={image.fileName}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span>
              Original:{' '}
              <strong className="font-mono tabular-nums text-slate-900">
                {image.width}×{image.height} px
              </strong>
            </span>
            <span>
              Output:{' '}
              <strong className="font-mono tabular-nums text-blue-600">
                {dimsValid ? `${targetW}×${targetH} px` : 'Invalid'}
              </strong>
              {editedBlob && dimsValid && ` · ${formatBytes(editedBlob.size)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
