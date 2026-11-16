import React, { useEffect, useState } from 'react';
import { FlipHorizontal2, FlipVertical2, RotateCcw, RotateCw } from 'lucide-react';
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

interface RotatorState {
  angle: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
  format: 'image/png' | 'image/jpeg' | 'image/webp';
}

export const ImageRotatorTool: React.FC = () => {
  const { image, error, setError, handleUpload, useWorkspaceImage, clearImage } =
    useActiveToolImage();
  const { editedUrl, editedBlob, setOutput } = useEditedObjectUrl();

  const initial: RotatorState = {
    angle: 0,
    flipH: false,
    flipV: false,
    format: 'image/png',
  };
  const { current, pushState, undo, redo, resetHistory, canUndo, canRedo } =
    useToolHistory<RotatorState>(initial);

  const [previewMode, setPreviewMode] = useState<PreviewMode>('edited');
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!image) return;
    const fmt =
      image.mimeType === 'image/jpeg' || image.mimeType === 'image/webp'
        ? image.mimeType
        : 'image/png';
    resetHistory({ angle: 0, flipH: false, flipV: false, format: fmt });
  }, [image, resetHistory]);

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
        const swap = current.angle === 90 || current.angle === 270;
        const w = swap ? img.naturalHeight : img.naturalWidth;
        const h = swap ? img.naturalWidth : img.naturalHeight;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        if (current.format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
        }
        ctx.translate(w / 2, h / 2);
        ctx.rotate((current.angle * Math.PI) / 180);
        ctx.scale(current.flipH ? -1 : 1, current.flipV ? -1 : 1);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        const blob = await canvasToBlob(canvas, current.format, 0.94);
        if (!cancelled) setOutput(blob);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Rotation failed.');
      } finally {
        if (!cancelled) setProcessing(false);
      }
    };
    run();
    return () => {
      cancelled = true;
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

  const swap = current.angle === 90 || current.angle === 270;
  const outW = swap ? image.height : image.width;
  const outH = swap ? image.width : image.height;

  const handleDownload = (): boolean => {
    if (!editedBlob) return false;
    const ext = getExtensionForMime(editedBlob.type);
    return downloadBlob(editedBlob, `${stripExtension(image.fileName)}-rotated.${ext}`);
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
        mode={previewMode}
        onModeChange={setPreviewMode}
        zoom={zoom}
        onZoomChange={setZoom}
        currentToolId="image-rotator-flipper"
        onSendToTool={async () => editedBlob}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="order-2 lg:order-1 lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Rotate Angle
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  pushState({
                    ...current,
                    angle: (((current.angle - 90) % 360 + 360) % 360) as RotatorState['angle'],
                  })
                }
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:bg-slate-50 cursor-pointer min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span>Left 90°</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  pushState({
                    ...current,
                    angle: ((current.angle + 90) % 360) as RotatorState['angle'],
                  })
                }
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:bg-slate-50 cursor-pointer min-h-[44px]"
              >
                <RotateCw className="w-4 h-4 text-blue-600" />
                <span>Right 90°</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-2">
              {([0, 90, 180, 270] as const).map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => pushState({ ...current, angle: deg })}
                  className={`py-2 rounded-lg text-xs font-mono font-medium border cursor-pointer min-h-[38px] ${
                    current.angle === deg
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Flip / Mirror
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => pushState({ ...current, flipH: !current.flipH })}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-medium cursor-pointer min-h-[44px] ${
                  current.flipH
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <FlipHorizontal2 className="w-4 h-4" />
                <span>Horizontal</span>
              </button>
              <button
                type="button"
                onClick={() => pushState({ ...current, flipV: !current.flipV })}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-medium cursor-pointer min-h-[44px] ${
                  current.flipV
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <FlipVertical2 className="w-4 h-4" />
                <span>Vertical</span>
              </button>
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
                  format: e.target.value as RotatorState['format'],
                })
              }
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm min-h-[44px]"
            >
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPG</option>
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
              Output Dimensions:{' '}
              <strong className="font-mono tabular-nums text-slate-900">
                {outW} × {outH} px
              </strong>
            </span>
            <span className="font-mono tabular-nums">
              Angle: {current.angle}°{current.flipH ? ' · Flip H' : ''}
              {current.flipV ? ' · Flip V' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
