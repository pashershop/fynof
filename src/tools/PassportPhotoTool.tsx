import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { Check } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { EditorToolbar } from '../components/EditorToolbar';
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
  loadImageFromUrl,
  replaceConnectedBackground,
  stripExtension,
} from '../utils/canvasUtils';

type PhotoSizeId = '35x45' | '40x40';
type CopyCount = 2 | 4 | 6 | 8;

interface PassportState {
  sizeId: PhotoSizeId;
  copies: CopyCount;
  dpi: 300 | 600;
  bgColor: string;
  removeBg: boolean;
  tolerance: number;
  zoomScale: number;
  offsetX: number;
  offsetY: number;
}

const INITIAL_PASSPORT: PassportState = {
  sizeId: '35x45',
  copies: 8,
  dpi: 300,
  bgColor: '#ffffff',
  removeBg: false,
  tolerance: 34,
  zoomScale: 1.0,
  offsetX: 0,
  offsetY: 0,
};

const PHOTO_SIZES: Record<PhotoSizeId, { label: string; wMm: number; hMm: number }> = {
  '35x45': { label: '35 × 45 mm (Standard Passport)', wMm: 35, hMm: 45 },
  '40x40': { label: '40 × 40 mm (Square Passport)', wMm: 40, hMm: 40 },
};

export const PassportPhotoTool: React.FC = () => {
  const { image, error, setError, handleUpload, useWorkspaceImage, clearImage } =
    useActiveToolImage();
  const { editedUrl: sheetPreviewUrl, editedBlob: sheetBlob, setOutput: setSheetOutput } =
    useEditedObjectUrl();
  const { editedBlob: singleBlob, setOutput: setSingleOutput } = useEditedObjectUrl();

  const { current, pushState, undo, redo, resetHistory, canUndo, canRedo } =
    useToolHistory<PassportState>(INITIAL_PASSPORT);

  const [previewTab, setPreviewTab] = useState<'sheet' | 'single'>('sheet');
  const [showGuide, setShowGuide] = useState(true);
  const [singlePreviewUrl, setSinglePreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [pdfSaved, setPdfSaved] = useState(false);

  const spec = PHOTO_SIZES[current.sizeId];
  const singlePxW = Math.round((spec.wMm / 25.4) * current.dpi);
  const singlePxH = Math.round((spec.hMm / 25.4) * current.dpi);
  const a4PxW = Math.round((210 / 25.4) * current.dpi);
  const a4PxH = Math.round((297 / 25.4) * current.dpi);

  useEffect(() => {
    return () => {
      if (singlePreviewUrl) URL.revokeObjectURL(singlePreviewUrl);
    };
  }, [singlePreviewUrl]);

  useEffect(() => {
    if (!image) {
      setSheetOutput(null);
      setSingleOutput(null);
      return;
    }

    let cancelled = false;
    const render = async () => {
      setProcessing(true);
      setError(null);
      try {
        const img = await loadImageFromUrl(image.objectUrl);

        let singleCanvas = document.createElement('canvas');
        singleCanvas.width = singlePxW;
        singleCanvas.height = singlePxH;
        const sCtx = singleCanvas.getContext('2d')!;
        sCtx.fillStyle = current.bgColor;
        sCtx.fillRect(0, 0, singlePxW, singlePxH);

        const imgRatio = img.naturalWidth / img.naturalHeight;
        const boxRatio = singlePxW / singlePxH;
        let drawW = singlePxW;
        let drawH = singlePxH;
        if (imgRatio > boxRatio) {
          drawH = singlePxH * current.zoomScale;
          drawW = drawH * imgRatio;
        } else {
          drawW = singlePxW * current.zoomScale;
          drawH = drawW / imgRatio;
        }
        const dx = (singlePxW - drawW) / 2 + (current.offsetX / 100) * singlePxW;
        const dy = (singlePxH - drawH) / 2 + (current.offsetY / 100) * singlePxH;
        sCtx.imageSmoothingEnabled = true;
        sCtx.imageSmoothingQuality = 'high';
        sCtx.drawImage(img, dx, dy, drawW, drawH);

        if (current.removeBg) {
          singleCanvas = replaceConnectedBackground(
            singleCanvas,
            current.bgColor,
            current.tolerance
          );
        }

        const sBlob = await canvasToBlob(singleCanvas, 'image/jpeg', 0.95);
        if (cancelled) return;
        setSingleOutput(sBlob);
        const sUrl = URL.createObjectURL(sBlob);
        setSinglePreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return sUrl;
        });

        const sheetDpi = 300;
        const sheetW = Math.round((210 / 25.4) * sheetDpi);
        const sheetH = Math.round((297 / 25.4) * sheetDpi);
        const cellW = Math.round((spec.wMm / 25.4) * sheetDpi);
        const cellH = Math.round((spec.hMm / 25.4) * sheetDpi);

        const sheet = document.createElement('canvas');
        sheet.width = sheetW;
        sheet.height = sheetH;
        const aCtx = sheet.getContext('2d')!;
        aCtx.fillStyle = '#ffffff';
        aCtx.fillRect(0, 0, sheetW, sheetH);

        const cols =
          current.copies === 2 ? 2 : current.copies === 4 ? 4 : current.copies === 6 ? 3 : 4;
        const gap = Math.round((6 / 25.4) * sheetDpi);
        const marginTop = Math.round((18 / 25.4) * sheetDpi);
        const totalRowW = cols * cellW + (cols - 1) * gap;
        const startX = Math.round((sheetW - totalRowW) / 2);

        for (let i = 0; i < current.copies; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = startX + col * (cellW + gap);
          const y = marginTop + row * (cellH + gap);

          aCtx.drawImage(singleCanvas, x, y, cellW, cellH);
          aCtx.strokeStyle = '#cbd5e1';
          aCtx.lineWidth = 2;
          aCtx.strokeRect(x, y, cellW, cellH);
        }

        const shBlob = await canvasToBlob(sheet, 'image/jpeg', 0.94);
        if (!cancelled) setSheetOutput(shBlob);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Passport render failed.');
      } finally {
        if (!cancelled) setProcessing(false);
      }
    };

    const timer = setTimeout(render, 110);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    image,
    current,
    singlePxW,
    singlePxH,
    spec.wMm,
    spec.hMm,
    setError,
    setSheetOutput,
    setSingleOutput,
  ]);

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

  const handleDownloadJpg = (): boolean => {
    const target = previewTab === 'single' ? singleBlob : sheetBlob;
    if (!target) return false;
    const suffix =
      previewTab === 'single'
        ? `${current.sizeId}-${current.dpi}dpi`
        : `A4-${current.copies}copies`;
    return downloadBlob(target, `${stripExtension(image.fileName)}-passport-${suffix}.jpg`);
  };

  const handleDownloadPdf = async () => {
    if (!sheetPreviewUrl) return;
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const img = await loadImageFromUrl(sheetPreviewUrl);
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d')!.drawImage(img, 0, 0);
      const dataUrl = c.toDataURL('image/jpeg', 0.95);
      pdf.addImage(dataUrl, 'JPEG', 0, 0, 210, 297);
      pdf.save(`${stripExtension(image.fileName)}-passport-A4-${current.copies}copies.pdf`);
      setPdfSaved(true);
      setTimeout(() => setPdfSaved(false), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF generation failed.');
    }
  };

  return (
    <div className="space-y-4">
      <EditorToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={() => resetHistory(INITIAL_PASSPORT)}
        onClearImage={clearImage}
        zoom={1}
        onZoomChange={() => {}}
        showCompare={false}
        currentToolId="passport-photo-maker"
        onSendToTool={async () => singleBlob}
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
              Passport Photo Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PHOTO_SIZES) as PhotoSizeId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => pushState({ ...current, sizeId: id })}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer min-h-[40px] ${
                    current.sizeId === id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {id === '35x45' ? '35 × 45 mm' : '40 × 40 mm'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Copies on A4 Sheet
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([2, 4, 6, 8] as CopyCount[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => pushState({ ...current, copies: c })}
                  className={`py-2 rounded-lg border text-xs font-mono font-semibold cursor-pointer min-h-[40px] ${
                    current.copies === c
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Print Resolution (DPI)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([300, 600] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => pushState({ ...current, dpi: d })}
                  className={`py-2 rounded-lg border text-xs font-mono font-semibold cursor-pointer min-h-[40px] ${
                    current.dpi === d
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {d} DPI
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">
              Background Color
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => pushState({ ...current, bgColor: '#ffffff' })}
                className={`py-2 px-2 rounded-lg border text-xs font-medium cursor-pointer min-h-[40px] ${
                  current.bgColor === '#ffffff'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                White
              </button>
              <button
                type="button"
                onClick={() => pushState({ ...current, bgColor: '#dbeafe' })}
                className={`py-2 px-2 rounded-lg border text-xs font-medium cursor-pointer min-h-[40px] ${
                  current.bgColor === '#dbeafe'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                Light Blue
              </button>
              <label className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer min-h-[40px]">
                <span>Custom</span>
                <input
                  type="color"
                  value={current.bgColor}
                  onChange={(e) => pushState({ ...current, bgColor: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer border-0"
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={current.removeBg}
                onChange={(e) => pushState({ ...current, removeBg: e.target.checked })}
                className="rounded border-slate-300 text-blue-600"
              />
              <span>Replace plain wall background automatically</span>
            </label>

            {current.removeBg && (
              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Edge Sensitivity</span>
                  <span className="font-mono tabular-nums">{current.tolerance}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={current.tolerance}
                  onChange={(e) =>
                    pushState({ ...current, tolerance: Number(e.target.value) })
                  }
                  className="w-full cursor-pointer"
                />
              </div>
            )}
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Face Zoom</span>
                <span className="font-mono tabular-nums text-blue-600">
                  {Math.round(current.zoomScale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={2.4}
                step={0.05}
                value={current.zoomScale}
                onChange={(e) =>
                  pushState({ ...current, zoomScale: Number(e.target.value) })
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

          <div className="grid grid-cols-1 gap-2.5 pt-2">
            <DownloadButton
              onClick={handleDownloadJpg}
              disabled={!sheetBlob || !singleBlob}
              loading={processing}
              label={previewTab === 'single' ? 'Download Single JPG' : 'Download A4 JPG'}
              sublabel={
                previewTab === 'single'
                  ? singleBlob
                    ? formatBytes(singleBlob.size)
                    : undefined
                  : sheetBlob
                  ? formatBytes(sheetBlob.size)
                  : undefined
              }
              className="w-full"
            />
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!sheetPreviewUrl || processing}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-blue-600 text-blue-600 text-sm font-semibold hover:bg-blue-50 disabled:opacity-50 cursor-pointer transition-colors min-h-[44px]"
            >
              {pdfSaved && <Check className="w-4 h-4" />}
              <span>{pdfSaved ? 'Saved A4 PDF' : 'Download A4 Printable PDF'}</span>
            </button>
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex p-1 rounded-lg bg-slate-100">
              <button
                type="button"
                onClick={() => setPreviewTab('sheet')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer min-h-[36px] ${
                  previewTab === 'sheet' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                A4 Printable Sheet ({current.copies} Copies)
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('single')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer min-h-[36px] ${
                  previewTab === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Single Photo ({spec.wMm}×{spec.hMm} mm)
              </button>
            </div>
            <div className="flex items-center gap-3">
              {previewTab === 'single' && (
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGuide}
                    onChange={(e) => setShowGuide(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Face Guide</span>
                </label>
              )}
              <span className="text-xs font-mono tabular-nums text-slate-600">
                {previewTab === 'single'
                  ? `${singlePxW}×${singlePxH} px @ ${current.dpi} DPI`
                  : `A4 210×297 mm (${a4PxW}×${a4PxH} px @ ${current.dpi} DPI)`}
              </span>
            </div>
          </div>

          <div className="w-full min-h-[320px] rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center p-6">
            {previewTab === 'sheet' && sheetPreviewUrl ? (
              <img
                src={sheetPreviewUrl}
                alt="A4 Printable Passport Sheet"
                className="max-h-[480px] w-auto rounded shadow-sm border border-slate-200 bg-white"
              />
            ) : (
              singlePreviewUrl && (
                <div className="relative inline-block">
                  <img
                    src={singlePreviewUrl}
                    alt="Single Passport Photo"
                    className="max-h-[360px] w-auto rounded shadow-sm border border-slate-200 bg-white"
                  />
                  {showGuide && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-[62%] h-[66%] -mt-6 rounded-[50%] border border-dashed border-blue-500/70" />
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
