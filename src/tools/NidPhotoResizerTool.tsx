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
  compressToTargetSize,
  downloadBlob,
  formatBytes,
  loadImageFromUrl,
  stripExtension,
} from '../utils/canvasUtils';

interface NidState {
  width: number;
  height: number;
  targetKb: number;
  cropZoom: number;
  offsetX: number;
  offsetY: number;
}

const INITIAL_NID: NidState = {
  width: 300,
  height: 300,
  targetKb: 100,
  cropZoom: 1,
  offsetX: 0,
  offsetY: 0,
};

export const NidPhotoResizerTool: React.FC = () => {
  const { image, error, setError, handleUpload, useWorkspaceImage, clearImage } =
    useActiveToolImage();
  const { editedUrl, editedBlob, setOutput } = useEditedObjectUrl();

  const { current, pushState, undo, redo, resetHistory, canUndo, canRedo } =
    useToolHistory<NidState>(INITIAL_NID);

  const [wText, setWText] = useState('300');
  const [hText, setHText] = useState('300');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('edited');
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setWText(String(current.width));
    setHText(String(current.height));
  }, [current.width, current.height]);

  const valid =
    current.width >= 50 &&
    current.width <= 2000 &&
    current.height >= 50 &&
    current.height <= 2000;

  useEffect(() => {
    if (!image) {
      setOutput(null);
      return;
    }
    if (!valid) {
      setError('Invalid dimensions. Width and height must be between 50 and 2000 px.');
      return;
    }

    let cancelled = false;
    const render = async () => {
      setProcessing(true);
      setError(null);
      try {
        const img = await loadImageFromUrl(image.objectUrl);
        const outW = Math.round(current.width);
        const outH = Math.round(current.height);

        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outW, outH);

        const imgRatio = img.naturalWidth / img.naturalHeight;
        const boxRatio = outW / outH;
        let dw = outW;
        let dh = outH;
        if (imgRatio > boxRatio) {
          dh = outH * current.cropZoom;
          dw = dh * imgRatio;
        } else {
          dw = outW * current.cropZoom;
          dh = dw / imgRatio;
        }
        const dx = (outW - dw) / 2 + (current.offsetX / 100) * outW;
        const dy = (outH - dh) / 2 + (current.offsetY / 100) * outH;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, dx, dy, dw, dh);

        const res = await compressToTargetSize(
          canvas,
          'image/jpeg',
          current.targetKb * 1024,
          { allowScaleDown: false, backgroundColor: '#ffffff' }
        );

        if (!cancelled) setOutput(res.blob);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Resize failed.');
      } finally {
        if (!cancelled) setProcessing(false);
      }
    };

    const timer = setTimeout(render, 100);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [image, current, valid, setError, setOutput]);

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
    if (!editedBlob || !valid) return false;
    return downloadBlob(
      editedBlob,
      `${stripExtension(image.fileName)}-${current.width}x${current.height}.jpg`
    );
  };

  const underLimit = editedBlob ? editedBlob.size <= current.targetKb * 1024 : false;

  return (
    <div className="space-y-4">
      <EditorToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={() => resetHistory(INITIAL_NID)}
        onClearImage={clearImage}
        mode={previewMode}
        onModeChange={setPreviewMode}
        zoom={zoom}
        onZoomChange={setZoom}
        currentToolId="nid-job-photo-resizer"
        onSendToTool={async () => editedBlob}
      />

      {error && (
        <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="order-2 lg:order-1 lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-4">
          <button
            type="button"
            onClick={() => pushState({ ...current, width: 300, height: 300 })}
            className={`w-full py-2.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer min-h-[42px] ${
              current.width === 300 && current.height === 300
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            300 × 300 px (Teletalk / NID Standard)
          </button>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Width (px)</label>
              <input
                type="number"
                min={50}
                max={2000}
                value={wText}
                onChange={(e) => {
                  setWText(e.target.value);
                  const n = Number(e.target.value);
                  if (e.target.value !== '' && Number.isFinite(n)) {
                    pushState({ ...current, width: n });
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Height (px)</label>
              <input
                type="number"
                min={50}
                max={2000}
                value={hText}
                onChange={(e) => {
                  setHText(e.target.value);
                  const n = Number(e.target.value);
                  if (e.target.value !== '' && Number.isFinite(n)) {
                    pushState({ ...current, height: n });
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Target File Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[20, 50, 100].map((kb) => (
                <button
                  key={kb}
                  type="button"
                  onClick={() => pushState({ ...current, targetKb: kb })}
                  className={`py-2 rounded-lg border text-xs font-mono font-semibold cursor-pointer min-h-[40px] ${
                    current.targetKb === kb
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {kb} KB
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Frame Zoom</span>
                <span className="font-mono tabular-nums text-blue-600">
                  {Math.round(current.cropZoom * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={2.4}
                step={0.05}
                value={current.cropZoom}
                onChange={(e) =>
                  pushState({ ...current, cropZoom: Number(e.target.value) })
                }
                className="w-full cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Horizontal</label>
                <input
                  type="range"
                  min={-40}
                  max={40}
                  value={current.offsetX}
                  onChange={(e) =>
                    pushState({ ...current, offsetX: Number(e.target.value) })
                  }
                  className="w-full cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Vertical</label>
                <input
                  type="range"
                  min={-40}
                  max={40}
                  value={current.offsetY}
                  onChange={(e) =>
                    pushState({ ...current, offsetY: Number(e.target.value) })
                  }
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          <DownloadButton
            onClick={handleDownload}
            disabled={!editedBlob || !valid}
            loading={processing}
            label="Download JPG"
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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs text-slate-500">Output Dimensions</div>
              <div className="mt-0.5 text-sm font-semibold font-mono tabular-nums text-slate-900">
                {valid ? `${current.width} × ${current.height} px` : 'Invalid'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Live JPG File Size</div>
              <div
                className={`mt-0.5 text-sm font-semibold font-mono tabular-nums ${
                  underLimit ? 'text-emerald-600' : 'text-blue-600'
                }`}
              >
                {processing ? 'Calculating...' : editedBlob ? formatBytes(editedBlob.size) : '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Target Limit</div>
              <div className="mt-0.5 text-sm font-semibold font-mono tabular-nums text-slate-900">
                ≤ {current.targetKb} KB
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
