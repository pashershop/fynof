import React, { useEffect, useState } from 'react';
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
  applySharpenConvolutionAsync,
  canvasToBlob,
  downloadBlob,
  formatBytes,
  getExtensionForMime,
  loadImageFromUrl,
  stripExtension,
} from '../utils/canvasUtils';

interface FilterState {
  preset: 'normal' | 'grayscale' | 'sepia' | 'vintage' | 'vivid';
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sharpen: number;
  intensity: number;
  format: 'image/jpeg' | 'image/png' | 'image/webp';
}

const INITIAL_FILTERS: FilterState = {
  preset: 'normal',
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  sharpen: 0,
  intensity: 100,
  format: 'image/jpeg',
};

const PRESETS: {
  id: FilterState['preset'];
  label: string;
  values: Partial<FilterState>;
}[] = [
  { id: 'normal', label: 'Normal', values: { brightness: 100, contrast: 100, saturation: 100 } },
  { id: 'grayscale', label: 'Grayscale', values: { brightness: 102, contrast: 108, saturation: 0 } },
  { id: 'sepia', label: 'Sepia', values: { brightness: 102, contrast: 105, saturation: 85 } },
  { id: 'vintage', label: 'Vintage', values: { brightness: 104, contrast: 92, saturation: 75 } },
  { id: 'vivid', label: 'Vivid', values: { brightness: 104, contrast: 112, saturation: 135 } },
];

export const ImageFiltersTool: React.FC = () => {
  const { image, error, setError, handleUpload, useWorkspaceImage, clearImage } =
    useActiveToolImage();
  const { editedUrl, editedBlob, setOutput } = useEditedObjectUrl();

  const { current, pushState, undo, redo, resetHistory, canUndo, canRedo } =
    useToolHistory<FilterState>(INITIAL_FILTERS);

  const [previewMode, setPreviewMode] = useState<PreviewMode>('compare');
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!image) {
      setOutput(null);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setProcessing(true);
      setError(null);
      try {
        const img = await loadImageFromUrl(image.objectUrl);
        const w = img.naturalWidth;
        const h = img.naturalHeight;

        const out = document.createElement('canvas');
        out.width = w;
        out.height = h;
        const ctx = out.getContext('2d')!;
        if (current.format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);

        const filtered = document.createElement('canvas');
        filtered.width = w;
        filtered.height = h;
        const fCtx = filtered.getContext('2d')!;

        const sepiaPct =
          current.preset === 'sepia' ? 85 : current.preset === 'vintage' ? 40 : 0;
        const grayscalePct = current.preset === 'grayscale' ? 100 : 0;
        const filterStr = [
          `brightness(${current.brightness}%)`,
          `contrast(${current.contrast}%)`,
          `saturate(${current.saturation}%)`,
          sepiaPct > 0 ? `sepia(${sepiaPct}%)` : '',
          grayscalePct > 0 ? `grayscale(${grayscalePct}%)` : '',
          current.blur > 0 ? `blur(${current.blur}px)` : '',
        ]
          .filter(Boolean)
          .join(' ');

        fCtx.filter = filterStr;
        fCtx.drawImage(img, 0, 0, w, h);
        fCtx.filter = 'none';

        if (current.preset === 'vintage') {
          fCtx.fillStyle = 'rgba(245, 210, 160, 0.12)';
          fCtx.fillRect(0, 0, w, h);
        }

        if (current.sharpen > 0) {
          await applySharpenConvolutionAsync(fCtx, w, h, current.sharpen);
        }
        if (cancelled) return;

        ctx.globalAlpha = current.intensity / 100;
        ctx.drawImage(filtered, 0, 0);
        ctx.globalAlpha = 1;

        const blob = await canvasToBlob(out, current.format, 0.92);
        if (!cancelled) setOutput(blob);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Filter error.');
      } finally {
        if (!cancelled) setProcessing(false);
      }
    };
    const timer = setTimeout(run, 130);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [image, current, setError, setOutput]);

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
    return downloadBlob(editedBlob, `${stripExtension(image.fileName)}-filtered.${ext}`);
  };

  return (
    <div className="space-y-4">
      <EditorToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={() => resetHistory(INITIAL_FILTERS)}
        onClearImage={clearImage}
        mode={previewMode}
        onModeChange={setPreviewMode}
        zoom={zoom}
        onZoomChange={setZoom}
        currentToolId="image-filters"
        onSendToTool={async () => editedBlob}
      />

      {error && (
        <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="order-2 lg:order-1 lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Filter Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    pushState({
                      ...current,
                      preset: p.id,
                      ...p.values,
                      blur: 0,
                      sharpen: 0,
                    })
                  }
                  className={`py-2 px-2 rounded-lg text-xs font-medium border cursor-pointer min-h-[38px] ${
                    current.preset === p.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {(
            [
              { key: 'intensity', label: 'Filter Intensity', min: 0, max: 100, unit: '%' },
              { key: 'brightness', label: 'Brightness', min: 50, max: 150, unit: '%' },
              { key: 'contrast', label: 'Contrast', min: 50, max: 150, unit: '%' },
              { key: 'saturation', label: 'Saturation', min: 0, max: 200, unit: '%' },
              { key: 'blur', label: 'Blur', min: 0, max: 10, unit: 'px' },
              { key: 'sharpen', label: 'Sharpen', min: 0, max: 100, unit: '%' },
            ] as const
          ).map((slider) => (
            <div key={slider.key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">{slider.label}</span>
                <span className="font-mono tabular-nums text-blue-600">
                  {current[slider.key]}
                  {slider.unit}
                </span>
              </div>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                value={current[slider.key]}
                onChange={(e) =>
                  pushState({ ...current, [slider.key]: Number(e.target.value) })
                }
                className="w-full cursor-pointer"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Output Format
            </label>
            <select
              value={current.format}
              onChange={(e) =>
                pushState({
                  ...current,
                  format: e.target.value as FilterState['format'],
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
