import React, { useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { UploadArea } from '../components/UploadArea';
import { formatBytes, loadImageFromUrl, validateImageFile } from '../utils/canvasUtils';

interface PdfImageItem {
  id: string;
  fileName: string;
  objectUrl: string;
  width: number;
  height: number;
  size: number;
}

export const ImageToPdfTool: React.FC = () => {
  const [items, setItems] = useState<PdfImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'a5' | 'custom'>('a4');
  const [customW, setCustomW] = useState(210);
  const [customH, setCustomH] = useState(297);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [marginMm, setMarginMm] = useState(10);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => URL.revokeObjectURL(it.objectUrl));
    };
  }, []);

  const addFiles = async (files: File[]) => {
    setError(null);
    const valid = files.filter((f) => !validateImageFile(f));
    if (valid.length === 0) {
      setError('Please select valid JPG, PNG, or WEBP images under 60 MB.');
      return;
    }

    const loaded: PdfImageItem[] = [];
    for (const file of valid) {
      const url = URL.createObjectURL(file);
      try {
        const img = await loadImageFromUrl(url);
        loaded.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          fileName: file.name,
          objectUrl: url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: file.size,
        });
      } catch {
        URL.revokeObjectURL(url);
      }
    }
    if (loaded.length === 0) {
      setError('Could not read the selected image files.');
      return;
    }
    setItems((prev) => [...prev, ...loaded]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.objectUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  };

  const clearAll = () => {
    items.forEach((i) => URL.revokeObjectURL(i.objectUrl));
    setItems([]);
  };

  const customValid =
    pageSize !== 'custom' || (customW >= 30 && customW <= 1200 && customH >= 30 && customH <= 1200);

  const handleGeneratePdf = async (): Promise<boolean> => {
    if (items.length === 0) return false;
    if (!customValid) {
      setError('Custom page dimensions must be between 30 mm and 1200 mm.');
      return false;
    }

    setGenerating(true);
    setError(null);
    setProgressText(`Preparing 1 of ${items.length}...`);
    try {
      const formatOpt: string | [number, number] =
        pageSize === 'custom' ? [customW, customH] : pageSize;

      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: formatOpt,
        compress: true,
      });

      const jpegQual = quality === 'low' ? 0.55 : quality === 'medium' ? 0.78 : 0.94;

      for (let i = 0; i < items.length; i++) {
        setProgressText(`Processing page ${i + 1} of ${items.length}...`);
        if (i > 0) pdf.addPage(formatOpt, orientation);
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const safeMargin = Math.min(marginMm, Math.min(pageW, pageH) / 3);
        const availW = Math.max(10, pageW - safeMargin * 2);
        const availH = Math.max(10, pageH - safeMargin * 2);

        const item = items[i];
        const img = await loadImageFromUrl(item.objectUrl);

        const maxSide = quality === 'low' ? 1400 : quality === 'medium' ? 2000 : 2800;
        let cw = img.naturalWidth;
        let ch = img.naturalHeight;
        if (cw > maxSide || ch > maxSide) {
          const s = Math.min(maxSide / cw, maxSide / ch);
          cw = Math.round(cw * s);
          ch = Math.round(ch * s);
        }

        const c = document.createElement('canvas');
        c.width = cw;
        c.height = ch;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(img, 0, 0, cw, ch);

        const dataUrl = c.toDataURL('image/jpeg', jpegQual);
        const imgRatio = cw / ch;
        const boxRatio = availW / availH;

        let drawW = availW;
        let drawH = availH;
        if (imgRatio > boxRatio) {
          drawH = availW / imgRatio;
        } else {
          drawW = availH * imgRatio;
        }

        const x = safeMargin + (availW - drawW) / 2;
        const y = safeMargin + (availH - drawH) / 2;
        pdf.addImage(dataUrl, 'JPEG', x, y, drawW, drawH, undefined, 'FAST');
      }

      pdf.save(`fynof-images-${items.length}pages.pdf`);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF generation failed.');
      return false;
    } finally {
      setGenerating(false);
      setProgressText(null);
    }
  };

  if (items.length === 0) {
    return (
      <UploadArea
        accept="image/jpeg,image/png,image/webp"
        multiple
        onFilesSelected={addFiles}
        supportedText="Select multiple JPG, PNG, or WEBP images"
        errorMessage={error}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* PDF Settings */}
      <div className="order-2 lg:order-1 lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Page Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['a4', 'a5', 'custom'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setPageSize(sz)}
                className={`py-2 rounded-lg border text-xs font-semibold uppercase cursor-pointer min-h-[40px] ${
                  pageSize === sz
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
          {pageSize === 'custom' && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Width (mm)</label>
                <input
                  type="number"
                  min={30}
                  max={1200}
                  value={customW}
                  onChange={(e) => setCustomW(Number(e.target.value) || 210)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-sm font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Height (mm)</label>
                <input
                  type="number"
                  min={30}
                  max={1200}
                  value={customH}
                  onChange={(e) => setCustomH(Number(e.target.value) || 297)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-sm font-mono tabular-nums"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Orientation
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['portrait', 'landscape'] as const).map((ori) => (
              <button
                key={ori}
                type="button"
                onClick={() => setOrientation(ori)}
                className={`py-2 rounded-lg border text-xs font-medium capitalize cursor-pointer min-h-[40px] ${
                  orientation === ori
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                {ori}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Page Margin</span>
            <span className="font-mono tabular-nums text-blue-600">{marginMm} mm</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {[0, 10, 15, 25].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMarginMm(m)}
                className={`py-1.5 rounded border text-xs font-mono cursor-pointer min-h-[36px] ${
                  marginMm === m
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                {m}mm
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            PDF Quality
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'low', label: 'Small' },
                { id: 'medium', label: 'Medium' },
                { id: 'high', label: 'High' },
              ] as const
            ).map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setQuality(q.id)}
                className={`py-2 rounded-lg border text-xs font-medium cursor-pointer min-h-[40px] ${
                  quality === q.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {progressText && (
          <p className="text-xs font-medium text-blue-600">{progressText}</p>
        )}

        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}

        <DownloadButton
          onClick={handleGeneratePdf}
          loading={generating}
          disabled={!customValid}
          label="Download PDF"
          sublabel={`${items.length} ${items.length === 1 ? 'page' : 'pages'}`}
          className="w-full"
        />
      </div>

      {/* Page Queue */}
      <div className="order-1 lg:order-2 lg:col-span-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-semibold text-slate-700 font-mono tabular-nums">
            {items.length} {items.length === 1 ? 'Page' : 'Pages'} · Drag or use arrows to reorder
          </span>
          <div className="flex items-center gap-2">
            <input
              ref={addInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(Array.from(e.target.files));
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => addInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 hover:bg-slate-100 cursor-pointer min-h-[38px]"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Add Images</span>
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer min-h-[38px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx !== null) moveItem(dragIdx, idx);
                setDragIdx(null);
              }}
              className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5 cursor-move hover:border-blue-400 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-blue-600">
                  Page {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove image"
                  className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="aspect-[3/4] rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100">
                <img
                  src={item.objectUrl}
                  alt={item.fileName}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] text-slate-500 truncate">
                  {formatBytes(item.size)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, idx - 1)}
                    aria-label="Move up"
                    className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => moveItem(idx, idx + 1)}
                    aria-label="Move down"
                    className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
