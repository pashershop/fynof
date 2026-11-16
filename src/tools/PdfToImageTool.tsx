import React, { useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Check, Download, Trash2 } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { UploadArea } from '../components/UploadArea';
import {
  HARD_MAX_PDF_BYTES,
  canvasToBlob,
  downloadBlob,
  formatBytes,
  stripExtension,
} from '../utils/canvasUtils';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfPageThumb {
  pageNumber: number;
  thumbUrl: string;
}

export const PdfToImageTool: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PdfPageThumb[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeText, setRangeText] = useState('');
  const [mode, setMode] = useState<'all' | 'specific'>('all');
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [scale, setScale] = useState<1 | 2 | 3 | 4>(2);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const pagesRef = useRef<PdfPageThumb[]>([]);
  pagesRef.current = pages;

  useEffect(() => {
    return () => {
      pagesRef.current.forEach((p) => URL.revokeObjectURL(p.thumbUrl));
      pdfDocRef.current?.cleanup();
    };
  }, []);

  const handleFilesSelected = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Unsupported file. Please upload a valid PDF document.');
      return;
    }
    if (file.size > HARD_MAX_PDF_BYTES) {
      setError(`PDF is too large (${formatBytes(file.size)}). Maximum supported size is 100 MB.`);
      return;
    }

    setError(null);
    setLoadingPdf(true);
    setProgressText('Reading PDF document...');
    pagesRef.current.forEach((p) => URL.revokeObjectURL(p.thumbUrl));
    setPages([]);

    try {
      const arrayBuf = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
      pdfDocRef.current = doc;
      setPdfFile(file);

      const thumbs: PdfPageThumb[] = [];
      const allNums: number[] = [];

      for (let p = 1; p <= doc.numPages; p++) {
        setProgressText(`Rendering preview ${p} of ${doc.numPages}...`);
        const page = await doc.getPage(p);
        const vp = page.getViewport({ scale: 0.45 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.floor(vp.width));
        canvas.height = Math.max(1, Math.floor(vp.height));
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;

        const blob = await canvasToBlob(canvas, 'image/jpeg', 0.8);
        const thumbUrl = URL.createObjectURL(blob);
        thumbs.push({ pageNumber: p, thumbUrl });
        allNums.push(p);
      }

      setPages(thumbs);
      setSelectedPages(allNums);
      setRangeText(`1-${doc.numPages}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not read PDF file. Ensure it is not corrupted or password-protected.'
      );
      setPdfFile(null);
    } finally {
      setLoadingPdf(false);
      setProgressText(null);
    }
  };

  const togglePage = (num: number) => {
    setMode('specific');
    setSelectedPages((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num].sort((a, b) => a - b)
    );
  };

  const applyRangeInput = (text: string) => {
    setRangeText(text);
    setMode('specific');
    const maxPage = pages.length;
    const nums = new Set<number>();
    text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((part) => {
        if (part.includes('-')) {
          const [a, b] = part.split('-').map((n) => parseInt(n.trim(), 10));
          if (Number.isFinite(a) && Number.isFinite(b)) {
            const start = Math.max(1, Math.min(a, b));
            const end = Math.min(maxPage, Math.max(a, b));
            for (let i = start; i <= end; i++) nums.add(i);
          }
        } else {
          const n = parseInt(part, 10);
          if (Number.isFinite(n) && n >= 1 && n <= maxPage) nums.add(n);
        }
      });
    setSelectedPages(Array.from(nums).sort((a, b) => a - b));
  };

  const renderPageBlob = async (pageNum: number): Promise<Blob> => {
    const doc = pdfDocRef.current;
    if (!doc) throw new Error('PDF not loaded.');
    const page = await doc.getPage(pageNum);
    const vp = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(vp.width));
    canvas.height = Math.max(1, Math.floor(vp.height));
    const ctx = canvas.getContext('2d')!;
    if (format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
    return canvasToBlob(canvas, format, 0.92);
  };

  const handleDownloadSingle = async (pageNum: number) => {
    if (!pdfFile) return;
    setExporting(true);
    setProgressText(`Exporting page ${pageNum}...`);
    try {
      const blob = await renderPageBlob(pageNum);
      const ext = format === 'image/png' ? 'png' : 'jpg';
      downloadBlob(blob, `${stripExtension(pdfFile.name)}-page-${pageNum}.${ext}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setExporting(false);
      setProgressText(null);
    }
  };

  const handleDownloadAll = async (): Promise<boolean> => {
    if (!pdfFile || !pdfDocRef.current) return false;
    const targets = mode === 'all' ? pages.map((p) => p.pageNumber) : selectedPages;
    if (targets.length === 0) {
      setError('Select at least one page to convert.');
      return false;
    }

    setExporting(true);
    setError(null);
    try {
      const ext = format === 'image/png' ? 'png' : 'jpg';
      const baseName = stripExtension(pdfFile.name);

      if (targets.length === 1) {
        setProgressText(`Exporting page ${targets[0]}...`);
        const blob = await renderPageBlob(targets[0]);
        return downloadBlob(blob, `${baseName}-page-${targets[0]}.${ext}`);
      } else {
        const zip = new JSZip();
        for (let i = 0; i < targets.length; i++) {
          const num = targets[i];
          setProgressText(`Converting page ${i + 1} of ${targets.length}...`);
          const blob = await renderPageBlob(num);
          zip.file(`${baseName}-page-${String(num).padStart(2, '0')}.${ext}`, blob);
        }
        setProgressText('Creating ZIP archive...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        return downloadBlob(zipBlob, `${baseName}-pages.zip`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF conversion failed.');
      return false;
    } finally {
      setExporting(false);
      setProgressText(null);
    }
  };

  const resetPdf = () => {
    pages.forEach((p) => URL.revokeObjectURL(p.thumbUrl));
    pdfDocRef.current?.cleanup();
    pdfDocRef.current = null;
    setPdfFile(null);
    setPages([]);
    setSelectedPages([]);
    setRangeText('');
    setError(null);
  };

  if (!pdfFile && !loadingPdf) {
    return (
      <UploadArea
        accept="application/pdf,.pdf"
        onFilesSelected={handleFilesSelected}
        supportedText="Supports PDF documents · Multi-page ZIP export"
        maxSizeText="Max size: 100 MB"
        errorMessage={error}
      />
    );
  }

  const activeCount = mode === 'all' ? pages.length : selectedPages.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Settings Panel */}
      <div className="order-2 lg:order-1 lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Pages to Export
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('all');
                setSelectedPages(pages.map((p) => p.pageNumber));
              }}
              className={`py-2 rounded-lg border text-xs font-medium cursor-pointer min-h-[40px] ${
                mode === 'all'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              All Pages ({pages.length})
            </button>
            <button
              type="button"
              onClick={() => setMode('specific')}
              className={`py-2 rounded-lg border text-xs font-medium cursor-pointer min-h-[40px] ${
                mode === 'specific'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              Specific ({selectedPages.length})
            </button>
          </div>
          {mode === 'specific' && (
            <div className="mt-2.5">
              <label className="block text-[11px] text-slate-500 mb-1">
                Page range (e.g. 1, 3-5)
              </label>
              <input
                type="text"
                value={rangeText}
                onChange={(e) => applyRangeInput(e.target.value)}
                placeholder="1, 3-5"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Output Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormat('image/jpeg')}
              className={`py-2 rounded-lg border text-xs font-semibold cursor-pointer min-h-[40px] ${
                format === 'image/jpeg'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              JPG
            </button>
            <button
              type="button"
              onClick={() => setFormat('image/png')}
              className={`py-2 rounded-lg border text-xs font-semibold cursor-pointer min-h-[40px] ${
                format === 'image/png'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              PNG
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Image Resolution
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { s: 1, label: '1x (72 DPI)' },
                { s: 2, label: '2x (144 DPI)' },
                { s: 3, label: '3x (216 DPI)' },
                { s: 4, label: '4x (300 DPI)' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.s}
                type="button"
                onClick={() => setScale(opt.s)}
                className={`py-2 rounded-lg border text-xs font-mono cursor-pointer min-h-[40px] ${
                  scale === opt.s
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                {opt.label}
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
          onClick={handleDownloadAll}
          disabled={loadingPdf || activeCount === 0}
          loading={exporting}
          label={activeCount > 1 ? `Download ZIP (${activeCount} Pages)` : 'Download Image'}
          className="w-full"
        />
      </div>

      {/* Page Thumbnails */}
      <div className="order-1 lg:order-2 lg:col-span-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-semibold text-slate-800 truncate">
            {pdfFile?.name}{' '}
            <span className="font-mono text-slate-500">
              ({pages.length} {pages.length === 1 ? 'page' : 'pages'})
            </span>
          </div>
          <button
            type="button"
            onClick={resetPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer min-h-[36px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Change PDF</span>
          </button>
        </div>

        {loadingPdf ? (
          <div className="p-12 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm text-slate-600">
            {progressText || 'Rendering PDF page previews...'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {pages.map((p) => {
              const isSelected = mode === 'all' || selectedPages.includes(p.pageNumber);
              return (
                <div
                  key={p.pageNumber}
                  onClick={() => togglePage(p.pageNumber)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer bg-white space-y-2 ${
                    isSelected ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-slate-700">
                      Page {p.pageNumber}
                    </span>
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </span>
                  </div>
                  <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center">
                    <img
                      src={p.thumbUrl}
                      alt={`Page ${p.pageNumber}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSingle(p.pageNumber);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer min-h-[36px]"
                  >
                    <Download className="w-3 h-3" />
                    <span>Save Page</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
