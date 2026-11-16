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
  canvasToBlob,
  detectImageTransparency,
  downloadBlob,
  formatBytes,
  getExtensionForMime,
  loadImageFromUrl,
  stripExtension,
} from '../utils/canvasUtils';

interface ConverterState {
  targetFormat: 'image/png' | 'image/jpeg' | 'image/webp';
  quality: number;
  bgColor: string;
}

export const ImageConverterTool: React.FC = () => {
  const { image, error, setError, handleUpload, useWorkspaceImage, clearImage } =
    useActiveToolImage();
  const { editedUrl, editedBlob, setOutput } = useEditedObjectUrl();

  const { current, pushState, undo, redo, resetHistory, canUndo, canRedo } =
    useToolHistory<ConverterState>({
      targetFormat: 'image/png',
      quality: 90,
      bgColor: '#ffffff',
    });

  const [hasTransparency, setHasTransparency] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('edited');
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!image) return;
    const defaultTarget =
      image.mimeType === 'image/png' ? 'image/jpeg' : 'image/png';
    resetHistory({
      targetFormat: defaultTarget,
      quality: 92,
      bgColor: '#ffffff',
    });
  }, [image, resetHistory]);

  useEffect(() => {
    if (!image) {
      setOutput(null);
      setHasTransparency(false);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setProcessing(true);
      setError(null);
      try {
        const img = await loadImageFromUrl(image.objectUrl);
        if (!cancelled) {
          setHasTransparency(detectImageTransparency(img));
        }

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        if (current.targetFormat === 'image/jpeg') {
          ctx.fillStyle = current.bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const blob = await canvasToBlob(
          canvas,
          current.targetFormat,
          current.quality / 100
        );
        if (!cancelled) setOutput(blob);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Conversion failed.');
        }
      } finally {
        if (!cancelled) setProcessing(false);
      }
    };
    const timer = setTimeout(run, 100);
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
        supportedText="JPG to PNG, PNG to JPG, JPG/PNG to WEBP, WEBP to JPG/PNG"
        errorMessage={error}
        allowWorkspaceReuse
        onUseWorkspaceImage={useWorkspaceImage}
      />
    );
  }

  const handleDownload = (): boolean => {
    if (!editedBlob) return false;
    const ext = getExtensionForMime(current.targetFormat);
    return downloadBlob(editedBlob, `${stripExtension(image.fileName)}.${ext}`);
  };

  const sourceExt = getExtensionForMime(image.mimeType).toUpperCase();
  const targetExt = getExtensionForMime(current.targetFormat).toUpperCase();

  return (
    <div className="space-y-4">
      <EditorToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={() =>
          resetHistory({
            targetFormat: current.targetFormat,
            quality: 92,
            bgColor: '#ffffff',
          })
        }
        onClearImage={clearImage}
        mode={previewMode}
        onModeChange={setPreviewMode}
        zoom={zoom}
        onZoomChange={setZoom}
        currentToolId="image-converter"
        onSendToTool={async () => editedBlob}
      />

      {error && (
        <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="order-2 lg:order-1 lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Output Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: 'image/jpeg', label: 'JPG' },
                  { value: 'image/png', label: 'PNG' },
                  { value: 'image/webp', label: 'WEBP' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => pushState({ ...current, targetFormat: opt.value })}
                  className={`py-2.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors min-h-[42px] ${
                    current.targetFormat === opt.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {current.targetFormat !== 'image/png' && (
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-700">Image Quality</span>
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
            </div>
          )}

          {current.targetFormat === 'image/jpeg' && (
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="text-xs font-semibold text-slate-700">
                Transparency Fill Background
              </div>
              <p className="text-[11px] text-slate-500">
                {hasTransparency
                  ? 'Transparency detected in your image. Select the solid background fill for JPG:'
                  : 'JPG does not support alpha transparency. Selected fill color applies to any transparent pixels:'}
              </p>
              <div className="flex items-center gap-2">
                {['#ffffff', '#000000', '#f1f5f9', '#dbeafe'].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    aria-label={`Fill ${hex}`}
                    onClick={() => pushState({ ...current, bgColor: hex })}
                    style={{ backgroundColor: hex }}
                    className={`w-8 h-8 rounded-md border cursor-pointer ${
                      current.bgColor === hex
                        ? 'ring-2 ring-blue-600 border-blue-600'
                        : 'border-slate-300'
                    }`}
                  />
                ))}
                <input
                  type="color"
                  value={current.bgColor}
                  onChange={(e) => pushState({ ...current, bgColor: e.target.value })}
                  aria-label="Custom background fill color"
                  className="w-9 h-8 rounded border border-slate-300 cursor-pointer"
                />
              </div>
            </div>
          )}

          <DownloadButton
            onClick={handleDownload}
            disabled={!editedBlob}
            loading={processing}
            label={`Download ${targetExt}`}
            sublabel={editedBlob ? formatBytes(editedBlob.size) : undefined}
            className="w-full"
          />
        </div>

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
              Conversion:{' '}
              <strong className="font-mono text-slate-900">
                {sourceExt} → {targetExt}
              </strong>{' '}
              · {image.width}×{image.height} px
            </span>
            <span className="font-mono tabular-nums">
              {formatBytes(image.size)} →{' '}
              <strong className="text-blue-600">
                {editedBlob ? formatBytes(editedBlob.size) : '—'}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
