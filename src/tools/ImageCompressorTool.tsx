import React, { useEffect, useState } from 'react';
import { DownloadButton } from '../components/DownloadButton';
import { EditorToolbar } from '../components/EditorToolbar';
import { ImagePreview, PreviewMode } from '../components/ImagePreview';
import { UploadArea } from '../components/UploadArea';
import { useApp } from '../context/AppContext';
import {
  useActiveToolImage,
  useEditedObjectUrl,
  useToolHistory,
} from '../hooks/useSingleImageTool';
import {
  canvasToBlob,
  compressToTargetSize,
  createCanvasFromImage,
  downloadBlob,
  formatBytes,
  getExtensionForMime,
  loadImageFromUrl,
  stripExtension,
} from '../utils/canvasUtils';

interface CompressorState {
  mode: 'quality' | 'target';
  quality: number;
  targetKb: number;
  outputFormat: 'original' | 'image/jpeg' | 'image/webp' | 'image/png';
}

const TARGET_PRESETS = [20, 50, 100, 200, 500];

export const ImageCompressorTool: React.FC = () => {
  const { t } = useApp();
  const { image, error, setError, handleUpload, useWorkspaceImage, clearImage } =
    useActiveToolImage();
  const { editedUrl, editedBlob, setOutput } = useEditedObjectUrl();

  const initialState: CompressorState = {
    mode: 'quality',
    quality: 75,
    targetKb: 100,
    outputFormat: 'original',
  };

  const { current, pushState, undo, redo, resetHistory, canUndo, canRedo } =
    useToolHistory<CompressorState>(initialState);

  const [targetInput, setTargetInput] = useState('100');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('compare');
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [outputDim, setOutputDim] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    setTargetInput(String(current.targetKb));
  }, [current.targetKb]);

  useEffect(() => {
    if (!image) {
      setOutput(null);
      return;
    }

    if (current.mode === 'target' && (current.targetKb < 5 || current.targetKb > 20000)) {
      setError('Invalid target size. Please enter a value between 5 KB and 20,000 KB.');
      return;
    }

    let cancelled = false;
    const run = async () => {
      setProcessing(true);
      setError(null);
      try {
        const img = await loadImageFromUrl(image.objectUrl);
        const targetMime =
          current.outputFormat === 'original'
            ? image.mimeType === 'image/png' ||
              image.mimeType === 'image/webp' ||
              image.mimeType === 'image/jpeg'
              ? image.mimeType
              : 'image/jpeg'
            : current.outputFormat;

        // Fill white only when output is JPEG (no alpha support); preserve alpha for PNG/WEBP
        const canvas = createCanvasFromImage(
          img,
          undefined,
          undefined,
          targetMime === 'image/jpeg' ? '#ffffff' : undefined
        );

        let blob: Blob;
        let outW = canvas.width;
        let outH = canvas.height;

        if (current.mode === 'target') {
          const result = await compressToTargetSize(
            canvas,
            targetMime,
            current.targetKb * 1024,
            { allowScaleDown: true, backgroundColor: '#ffffff' }
          );
          blob = result.blob;
          outW = result.width;
          outH = result.height;
        } else {
          if (targetMime === 'image/png') {
            if (current.quality < 95) {
              const approxTarget = Math.max(
                10 * 1024,
                Math.round((image.size * current.quality) / 100)
              );
              const res = await compressToTargetSize(canvas, 'image/png', approxTarget, {
                allowScaleDown: false,
              });
              blob = res.blob;
            } else {
              blob = await canvasToBlob(canvas, 'image/png');
            }
          } else {
            blob = await canvasToBlob(canvas, targetMime, current.quality / 100);
          }
        }

        if (!cancelled) {
          setOutput(blob);
          setOutputDim({ w: outW, h: outH });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Compression failed.');
        }
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
        supportedText="JPG, JPEG, PNG, WEBP"
        errorMessage={error}
        allowWorkspaceReuse
        onUseWorkspaceImage={useWorkspaceImage}
      />
    );
  }

  const savedBytes = editedBlob ? image.size - editedBlob.size : 0;
  const savedPercent =
    editedBlob && image.size > 0 ? ((savedBytes / image.size) * 100).toFixed(1) : '0.0';

  const handleDownload = (): boolean => {
    if (!editedBlob) return false;
    const ext = getExtensionForMime(editedBlob.type);
    return downloadBlob(editedBlob, `${stripExtension(image.fileName)}-compressed.${ext}`);
  };

  return (
    <div className="space-y-4">
      <EditorToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={() => resetHistory(initialState)}
        onClearImage={() => {
          clearImage();
          resetHistory(initialState);
        }}
        mode={previewMode}
        onModeChange={setPreviewMode}
        zoom={zoom}
        onZoomChange={setZoom}
        currentToolId="image-compressor"
        onSendToTool={async () => editedBlob}
      />

      {error && (
        <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Panel (Left on Desktop, Bottom on Mobile) */}
        <div className="order-2 lg:order-1 lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Compression Mode
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-slate-100">
              <button
                type="button"
                onClick={() => pushState({ ...current, mode: 'quality' })}
                className={`py-2 text-xs font-medium rounded-md cursor-pointer transition-colors min-h-[38px] ${
                  current.mode === 'quality'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quality Slider
              </button>
              <button
                type="button"
                onClick={() => pushState({ ...current, mode: 'target' })}
                className={`py-2 text-xs font-medium rounded-md cursor-pointer transition-colors min-h-[38px] ${
                  current.mode === 'target'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Target File Size
              </button>
            </div>
          </div>

          {current.mode === 'quality' ? (
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-700">Quality</span>
                <span className="font-mono tabular-nums font-semibold text-blue-600">
                  {current.quality}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={current.quality}
                onChange={(e) =>
                  pushState({ ...current, quality: Number(e.target.value) })
                }
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Smallest file</span>
                <span>Best quality</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Target Size Presets (KB)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TARGET_PRESETS.map((kb) => (
                    <button
                      key={kb}
                      type="button"
                      onClick={() => pushState({ ...current, mode: 'target', targetKb: kb })}
                      className={`py-2 px-2 rounded-lg text-xs font-mono font-medium border cursor-pointer transition-colors min-h-[40px] ${
                        current.targetKb === kb
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {kb} KB
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Custom Target (KB)
                </label>
                <input
                  type="number"
                  min={5}
                  max={20000}
                  value={targetInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTargetInput(val);
                    const num = Number(val);
                    if (val !== '' && Number.isFinite(num)) {
                      pushState({ ...current, targetKb: num });
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Output Format
            </label>
            <select
              value={current.outputFormat}
              onChange={(e) =>
                pushState({
                  ...current,
                  outputFormat: e.target.value as CompressorState['outputFormat'],
                })
              }
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
            >
              <option value="original">
                Keep Original ({image.mimeType.split('/')[1]?.toUpperCase()})
              </option>
              <option value="image/jpeg">JPG (Smallest for Photos)</option>
              <option value="image/webp">WEBP (Transparency + Small Size)</option>
              <option value="image/png">PNG (Transparency Preserved)</option>
            </select>
          </div>

          {outputDim && (
            <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>{t.editor.dimensions}</span>
              <span className="font-mono tabular-nums text-slate-800">
                {outputDim.w} × {outputDim.h} px
              </span>
            </div>
          )}

          <DownloadButton
            onClick={handleDownload}
            disabled={!editedBlob}
            loading={processing}
            sublabel={editedBlob ? formatBytes(editedBlob.size) : undefined}
            className="w-full"
          />
        </div>

        {/* Preview Viewport (Top on Mobile, Right/Main on Desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-8 space-y-3">
          <ImagePreview
            originalUrl={image.objectUrl}
            editedUrl={editedUrl}
            mode={previewMode}
            zoom={zoom}
            alt={image.fileName}
          />

          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs text-slate-500">{t.editor.originalSize}</div>
              <div className="mt-0.5 text-sm sm:text-base font-semibold font-mono tabular-nums text-slate-900">
                {formatBytes(image.size)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">{t.editor.outputSize}</div>
              <div className="mt-0.5 text-sm sm:text-base font-semibold font-mono tabular-nums text-blue-600">
                {processing ? t.editor.processing : editedBlob ? formatBytes(editedBlob.size) : '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">{t.editor.saved}</div>
              <div
                className={`mt-0.5 text-sm sm:text-base font-semibold font-mono tabular-nums ${
                  savedBytes > 0 ? 'text-emerald-600' : 'text-slate-700'
                }`}
              >
                {editedBlob ? `${savedBytes >= 0 ? '-' : '+'}${Math.abs(Number(savedPercent))}%` : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
