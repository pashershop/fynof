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
  compressToTargetSize,
  downloadBlob,
  formatBytes,
  getExtensionForMime,
  loadImageFromUrl,
  stripExtension,
} from '../utils/canvasUtils';

interface SignatureState {
  width: number;
  height: number;
  targetKb: number;
  enforceTargetKb: boolean;
  blackAndWhite: boolean;
  threshold: number;
  cropPadX: number;
  cropPadY: number;
  format: 'image/jpeg' | 'image/png';
}

const INITIAL_SIG: SignatureState = {
  width: 300,
  height: 80,
  targetKb: 20,
  enforceTargetKb: true,
  blackAndWhite: true,
  threshold: 145,
  cropPadX: 0,
  cropPadY: 0,
  format: 'image/jpeg',
};

export const SignatureResizerTool: React.FC = () => {
  const { image, error, setError, handleUpload, useWorkspaceImage, clearImage } =
    useActiveToolImage();
  const { editedUrl, editedBlob, setOutput } = useEditedObjectUrl();

  const { current, pushState, undo, redo, resetHistory, canUndo, canRedo } =
    useToolHistory<SignatureState>(INITIAL_SIG);

  const [wText, setWText] = useState('300');
  const [hText, setHText] = useState('80');
  const [kbText, setKbText] = useState('20');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('edited');
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setWText(String(current.width));
    setHText(String(current.height));
    setKbText(String(current.targetKb));
  }, [current.width, current.height, current.targetKb]);

  const valid =
    current.width >= 40 &&
    current.width <= 2000 &&
    current.height >= 20 &&
    current.height <= 1000 &&
    (!current.enforceTargetKb || (current.targetKb >= 5 && current.targetKb <= 500));

  useEffect(() => {
    if (!image) {
      setOutput(null);
      return;
    }
    if (!valid) {
      setError(
        'Invalid dimensions or target size (Width 40–2000 px, Height 20–1000 px, Target 5–500 KB).'
      );
      return;
    }

    let cancelled = false;
    const render = async () => {
      setProcessing(true);
      setError(null);
      try {
        const img = await loadImageFromUrl(image.objectUrl);
        const sx = Math.round((current.cropPadX / 100) * img.naturalWidth);
        const sy = Math.round((current.cropPadY / 100) * img.naturalHeight);
        const sw = Math.max(10, img.naturalWidth - sx * 2);
        const sh = Math.max(10, img.naturalHeight - sy * 2);

        const outW = Math.round(current.width);
        const outH = Math.round(current.height);

        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outW, outH);

        const srcRatio = sw / sh;
        const dstRatio = outW / outH;
        let dw = outW;
        let dh = outH;
        if (srcRatio > dstRatio) {
          dh = outW / srcRatio;
        } else {
          dw = outH * srcRatio;
        }
        const dx = (outW - dw) / 2;
        const dy = (outH - dh) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

        if (current.blackAndWhite) {
          const imgData = ctx.getImageData(0, 0, outW, outH);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            const val = lum > current.threshold ? 255 : Math.max(0, Math.round(lum * 0.45));
            d[i] = val;
            d[i + 1] = val;
            d[i + 2] = val;
          }
          ctx.putImageData(imgData, 0, 0);
        }

        let blob: Blob;
        if (current.enforceTargetKb) {
          const res = await compressToTargetSize(
            canvas,
            current.format,
            current.targetKb * 1024,
            { allowScaleDown: false, backgroundColor: '#ffffff' }
          );
          blob = res.blob;
        } else {
          blob = await canvasToBlob(canvas, current.format, 0.94);
        }

        if (!cancelled) setOutput(blob);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Signature resize failed.');
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
    const ext = getExtensionForMime(current.format);
    return downloadBlob(
      editedBlob,
      `${stripExtension(image.fileName)}-signature-${current.width}x${current.height}.${ext}`
    );
  };

  return (
    <div className="space-y-4">
      <EditorToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={() => resetHistory(INITIAL_SIG)}
        onClearImage={clearImage}
        mode={previewMode}
        onModeChange={setPreviewMode}
        zoom={zoom}
        onZoomChange={setZoom}
        currentToolId="signature-resizer"
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
            onClick={() =>
              pushState({
                ...current,
                width: 300,
                height: 80,
                targetKb: 20,
                enforceTargetKb: true,
              })
            }
            className={`w-full py-2.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer min-h-[42px] ${
              current.width === 300 && current.height === 80
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            300 × 80 px Standard Preset (20 KB)
          </button>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Width (px)</label>
              <input
                type="number"
                min={40}
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
                min={20}
                max={1000}
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

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700">Crop Signature Margins</div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Trim Left/Right</span>
                <span className="font-mono tabular-nums">{current.cropPadX}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={35}
                value={current.cropPadX}
                onChange={(e) =>
                  pushState({ ...current, cropPadX: Number(e.target.value) })
                }
                className="w-full cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Trim Top/Bottom</span>
                <span className="font-mono tabular-nums">{current.cropPadY}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={35}
                value={current.cropPadY}
                onChange={(e) =>
                  pushState({ ...current, cropPadY: Number(e.target.value) })
                }
                className="w-full cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={current.blackAndWhite}
                onChange={(e) =>
                  pushState({ ...current, blackAndWhite: e.target.checked })
                }
                className="rounded border-slate-300 text-blue-600"
              />
              <span>Black & White Ink Cleanup</span>
            </label>
            {current.blackAndWhite && (
              <div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Paper Whiteness Threshold</span>
                  <span className="font-mono tabular-nums">{current.threshold}</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={220}
                  value={current.threshold}
                  onChange={(e) =>
                    pushState({ ...current, threshold: Number(e.target.value) })
                  }
                  className="w-full cursor-pointer"
                />
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={current.enforceTargetKb}
                onChange={(e) =>
                  pushState({ ...current, enforceTargetKb: e.target.checked })
                }
                className="rounded border-slate-300 text-blue-600"
              />
              <span>Enforce Target File Size (KB)</span>
            </label>
            {current.enforceTargetKb && (
              <input
                type="number"
                min={5}
                max={500}
                value={kbText}
                onChange={(e) => {
                  setKbText(e.target.value);
                  const n = Number(e.target.value);
                  if (e.target.value !== '' && Number.isFinite(n)) {
                    pushState({ ...current, targetKb: n });
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono tabular-nums"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Download Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => pushState({ ...current, format: 'image/jpeg' })}
                className={`py-2 rounded-lg border text-xs font-semibold cursor-pointer min-h-[40px] ${
                  current.format === 'image/jpeg'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                JPG
              </button>
              <button
                type="button"
                onClick={() => pushState({ ...current, format: 'image/png' })}
                className={`py-2 rounded-lg border text-xs font-semibold cursor-pointer min-h-[40px] ${
                  current.format === 'image/png'
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
            disabled={!editedBlob || !valid}
            loading={processing}
            label={`Download ${current.format === 'image/jpeg' ? 'JPG' : 'PNG'}`}
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
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-600">
              Dimensions:{' '}
              <strong className="font-mono tabular-nums text-slate-900">
                {valid ? `${current.width} × ${current.height} px` : 'Invalid'}
              </strong>
            </span>
            <span className="text-slate-600">
              File Size:{' '}
              <strong
                className={`font-mono tabular-nums ${
                  editedBlob &&
                  current.enforceTargetKb &&
                  editedBlob.size <= current.targetKb * 1024
                    ? 'text-emerald-600'
                    : 'text-blue-600'
                }`}
              >
                {editedBlob ? formatBytes(editedBlob.size) : '—'}
              </strong>
              {current.enforceTargetKb && ` (Limit: ${current.targetKb} KB)`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
