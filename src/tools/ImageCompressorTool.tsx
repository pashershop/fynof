import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, Sparkles } from 'lucide-react';
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
  cleanTransparentRgb,
  compressToTargetSize,
  createCanvasFromImage,
  detectImageTransparency,
  downloadBlob,
  formatBytes,
  getExtensionForMime,
  loadImageFromUrl,
  quantizeCanvasColorsAsync,
  stripExtension,
} from '../utils/canvasUtils';

type FormatOption = 'smart' | 'original' | 'image/jpeg' | 'image/webp' | 'image/png';
type PngStrategy = 'lossless' | 'lossy';

interface CompressorState {
  mode: 'quality' | 'target';
  quality: number;
  targetKb: number;
  outputFormat: FormatOption;
  pngStrategy: PngStrategy;
  smartCompression: boolean;
}

interface CompressionMeta {
  strategyLabel: string;
  compressionKind: 'lossy' | 'lossless';
  resolvedMime: string;
  qualityUsed: number | null;
  targetMet: boolean;
  isSmaller: boolean;
  smartAdjusted: boolean;
  convertedFromPng: boolean;
  hasTransparency: boolean;
  width: number;
  height: number;
}

const TARGET_PRESETS = [20, 50, 100, 200, 500];

function shortFormatLabel(mime: string): string {
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'JPG';
  if (mime === 'image/webp') return 'WEBP';
  if (mime === 'image/png') return 'PNG';
  return mime.split('/')[1]?.toUpperCase() || 'IMG';
}

async function findLossyBelowOriginal(
  canvas: HTMLCanvasElement,
  mimeType: string,
  startQuality: number,
  maxBytes: number
): Promise<{ blob: Blob; quality: number } | null> {
  // Search between 0.25 and startQuality - 0.02 for highest quality strictly below maxBytes
  let low = 0.25;
  let high = Math.max(low, startQuality - 0.02);
  let bestBlob: Blob | null = null;
  let bestQ = low;

  const minCheck = await canvasToBlob(canvas, mimeType, low);
  if (minCheck.size >= maxBytes) {
    return null;
  }
  bestBlob = minCheck;
  bestQ = low;

  for (let i = 0; i < 7; i++) {
    const mid = (low + high) / 2;
    const cand = await canvasToBlob(canvas, mimeType, mid);
    if (cand.size < maxBytes) {
      bestBlob = cand;
      bestQ = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  return bestBlob ? { blob: bestBlob, quality: bestQ } : null;
}

export const ImageCompressorTool: React.FC = () => {
  const { lang, t } = useApp();
  const { image, error, setError, handleUpload, useWorkspaceImage, clearImage } =
    useActiveToolImage();
  const { editedUrl, editedBlob, setOutput } = useEditedObjectUrl();

  const initialState: CompressorState = {
    mode: 'quality',
    quality: 75,
    targetKb: 100,
    outputFormat: 'smart',
    pngStrategy: 'lossless',
    smartCompression: true,
  };

  const { current, pushState, undo, redo, resetHistory, canUndo, canRedo } =
    useToolHistory<CompressorState>(initialState);

  const [targetInput, setTargetInput] = useState('100');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('compare');
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [meta, setMeta] = useState<CompressionMeta | null>(null);

  useEffect(() => {
    setTargetInput(String(current.targetKb));
  }, [current.targetKb]);

  const originalNormMime =
    image?.mimeType === 'image/png' ||
    image?.mimeType === 'image/webp' ||
    image?.mimeType === 'image/jpeg'
      ? image.mimeType
      : 'image/jpeg';

  // Effective target mime before smart PNG->WEBP fallback
  const requestedMime =
    current.outputFormat === 'smart' || current.outputFormat === 'original'
      ? originalNormMime
      : current.outputFormat;

  const isPngSelected = requestedMime === 'image/png';

  useEffect(() => {
    if (!image) {
      setOutput(null);
      setMeta(null);
      return;
    }

    if (current.mode === 'target' && (current.targetKb < 5 || current.targetKb > 20000)) {
      setError(
        lang === 'en'
          ? 'Invalid target size. Please enter a value between 5 KB and 20,000 KB.'
          : 'অকার্যকর টার্গেট সাইজ। অনুগ্রহ করে ৫ KB থেকে ২০,০০০ KB-এর মধ্যে মান দিন।'
      );
      return;
    }

    let cancelled = false;
    const run = async () => {
      setProcessing(true);
      setError(null);
      try {
        const img = await loadImageFromUrl(image.objectUrl);
        const hasTransparency = detectImageTransparency(img);
        const baseOriginalMime =
          image.mimeType === 'image/png' ||
          image.mimeType === 'image/webp' ||
          image.mimeType === 'image/jpeg'
            ? image.mimeType
            : 'image/jpeg';

        let resolvedMime =
          current.outputFormat === 'smart' || current.outputFormat === 'original'
            ? baseOriginalMime
            : current.outputFormat;

        // Build canvas (fill white ONLY if output is JPEG; preserve alpha for PNG/WEBP)
        let canvas = createCanvasFromImage(
          img,
          undefined,
          undefined,
          resolvedMime === 'image/jpeg' ? '#ffffff' : undefined
        );

        let blob: Blob;
        let outW = canvas.width;
        let outH = canvas.height;
        let qualityUsed: number | null = current.quality;
        let compressionKind: 'lossy' | 'lossless' = 'lossy';
        let targetMet = true;
        let smartAdjusted = false;
        let convertedFromPng = false;
        let strategyLabel = '';

        if (current.mode === 'target') {
          const requestedBytes = current.targetKb * 1024;
          // In smart mode, avoid inflating an already smaller original file when target > original.size
          const effectiveBytes =
            current.smartCompression &&
            requestedBytes >= image.size &&
            resolvedMime === baseOriginalMime
              ? Math.max(4096, Math.floor(image.size * 0.9))
              : requestedBytes;

          let res = await compressToTargetSize(canvas, resolvedMime, effectiveBytes, {
            allowScaleDown: true,
            backgroundColor: '#ffffff',
          });

          if (
            current.smartCompression &&
            current.outputFormat === 'smart' &&
            resolvedMime === 'image/png' &&
            (!res.targetMet || res.blob.size >= image.size)
          ) {
            const webpRes = await compressToTargetSize(
              canvas,
              'image/webp',
              requestedBytes,
              { allowScaleDown: true }
            );
            if (webpRes.blob.size < res.blob.size) {
              res = webpRes;
              resolvedMime = 'image/webp';
              convertedFromPng = true;
              smartAdjusted = true;
            }
          }

          blob = res.blob;
          outW = res.width;
          outH = res.height;
          qualityUsed = Math.round(res.qualityUsed * 100);
          targetMet = blob.size <= requestedBytes;
          compressionKind =
            resolvedMime === 'image/png' && res.qualityUsed >= 0.99 ? 'lossless' : 'lossy';
          strategyLabel = convertedFromPng
            ? 'PNG → WEBP Target Optimization'
            : `${shortFormatLabel(resolvedMime)} Target Optimization`;
        } else {
          // Quality Mode
          if (resolvedMime === 'image/png') {
            const cleanedCanvas = cleanTransparentRgb(canvas);
            const losslessBlob = await canvasToBlob(cleanedCanvas, 'image/png');

            if (current.outputFormat === 'smart' && current.smartCompression) {
              // Step 1: Test Lossless PNG optimization first
              if (losslessBlob.size < image.size * 0.96) {
                blob = losslessBlob;
                compressionKind = 'lossless';
                qualityUsed = null;
                strategyLabel = 'PNG Lossless Optimization';
              } else {
                // Step 2: Lossless couldn't shrink PNG — Smart Convert PNG -> WEBP (preserves alpha!)
                const q = Math.max(0.1, Math.min(1, current.quality / 100));
                let webpCand = await canvasToBlob(canvas, 'image/webp', q);
                let finalQ = q;
                if (webpCand.size >= image.size) {
                  const lowerWebp = await findLossyBelowOriginal(
                    canvas,
                    'image/webp',
                    q,
                    Math.floor(image.size * 0.98)
                  );
                  if (lowerWebp) {
                    webpCand = lowerWebp.blob;
                    finalQ = lowerWebp.quality;
                  }
                }

                if (webpCand.size < image.size || webpCand.size < losslessBlob.size) {
                  blob = webpCand;
                  resolvedMime = 'image/webp';
                  compressionKind = 'lossy';
                  qualityUsed = Math.round(finalQ * 100);
                  convertedFromPng = true;
                  smartAdjusted = true;
                  strategyLabel = 'Smart PNG → WEBP (Transparency Preserved)';
                } else {
                  blob = losslessBlob;
                  compressionKind = 'lossless';
                  qualityUsed = null;
                  strategyLabel = 'PNG Lossless Optimization';
                }
              }
            } else if (current.pngStrategy === 'lossless') {
              blob = losslessBlob;
              compressionKind = 'lossless';
              qualityUsed = null;
              strategyLabel = 'PNG Lossless Optimization';
            } else {
              // Explicit Lossy PNG via Color Quantization
              const levels = Math.max(4, Math.round((current.quality / 100) * 56));
              const qCanvas = await quantizeCanvasColorsAsync(cleanedCanvas, levels);
              const qBlob = await canvasToBlob(qCanvas, 'image/png');
              if (qBlob.size <= losslessBlob.size) {
                blob = qBlob;
              } else {
                blob = losslessBlob;
              }
              compressionKind = 'lossy';
              qualityUsed = current.quality;
              strategyLabel = `PNG Lossy Color Reduction (${levels} levels/ch)`;
            }
          } else {
            // Lossy JPG or WEBP Quality Optimization
            const requestedQ = Math.max(0.1, Math.min(1, current.quality / 100));
            let candBlob = await canvasToBlob(canvas, resolvedMime, requestedQ);
            let finalQ = requestedQ;

            if (current.smartCompression && candBlob.size >= image.size) {
              const lower = await findLossyBelowOriginal(
                canvas,
                resolvedMime,
                requestedQ,
                Math.floor(image.size * 0.98)
              );
              if (lower && lower.blob.size < candBlob.size) {
                candBlob = lower.blob;
                finalQ = lower.quality;
                smartAdjusted = true;
              } else if (
                current.outputFormat === 'smart' &&
                resolvedMime === 'image/jpeg'
              ) {
                // Fallback to WEBP if JPG couldn't beat original size
                const webpTry = await canvasToBlob(canvas, 'image/webp', requestedQ);
                const lowerWebp =
                  webpTry.size >= image.size
                    ? await findLossyBelowOriginal(
                        canvas,
                        'image/webp',
                        requestedQ,
                        Math.floor(image.size * 0.98)
                      )
                    : { blob: webpTry, quality: requestedQ };
                if (lowerWebp && lowerWebp.blob.size < candBlob.size) {
                  candBlob = lowerWebp.blob;
                  finalQ = lowerWebp.quality;
                  resolvedMime = 'image/webp';
                  smartAdjusted = true;
                }
              }
            }

            blob = candBlob;
            compressionKind = 'lossy';
            qualityUsed = Math.round(finalQ * 100);
            strategyLabel = `${shortFormatLabel(resolvedMime)} Quality Optimization`;
          }
        }

        if (!cancelled) {
          setOutput(blob);
          setMeta({
            strategyLabel,
            compressionKind,
            resolvedMime,
            qualityUsed,
            targetMet,
            isSmaller: blob.size < image.size,
            smartAdjusted,
            convertedFromPng,
            hasTransparency,
            width: outW,
            height: outH,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Compression failed.');
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
  }, [image, current, lang, setError, setOutput]);

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

  const diffBytes = editedBlob ? image.size - editedBlob.size : 0;
  const rawPercent =
    editedBlob && image.size > 0 ? Math.abs((diffBytes / image.size) * 100) : 0;
  const formattedPercent = rawPercent.toFixed(1);

  const isOutputSmaller = Boolean(editedBlob && editedBlob.size < image.size);
  const isOutputLarger = Boolean(editedBlob && editedBlob.size > image.size);
  const isOutputSame = Boolean(editedBlob && editedBlob.size === image.size);
  const isTargetMissed = Boolean(
    editedBlob && current.mode === 'target' && meta && !meta.targetMet
  );
  const isSuccess = Boolean(editedBlob && isOutputSmaller && !isTargetMissed);

  const handleDownload = (): boolean => {
    if (!editedBlob) return false;
    const ext = getExtensionForMime(editedBlob.type || meta?.resolvedMime || 'image/jpeg');
    return downloadBlob(editedBlob, `${stripExtension(image.fileName)}-compressed.${ext}`);
  };

  const handleDownloadOriginal = () => {
    const ext = getExtensionForMime(image.mimeType);
    downloadBlob(image.blob, `${stripExtension(image.fileName)}-original.${ext}`);
  };

  const handleFitBelowOriginal = () => {
    if (isPngSelected && current.outputFormat === 'image/png') {
      pushState({
        ...current,
        mode: 'quality',
        pngStrategy: 'lossy',
        quality: Math.min(current.quality, 45),
      });
    } else {
      pushState({
        ...current,
        mode: 'quality',
        smartCompression: true,
        quality: Math.min(current.quality, 60),
      });
    }
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
        <div
          role="alert"
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Panel (Left on Desktop, Bottom on Mobile) */}
        <div className="order-2 lg:order-1 lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-5">
          {/* Smart Compression Toggle */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{lang === 'en' ? 'Smart Compression' : 'স্মার্ট কম্প্রেশন'}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {lang === 'en'
                  ? 'Prevents size growth and picks the best strategy per format.'
                  : 'ফাইলের সাইজ বেড়ে যাওয়া রোধ করে এবং ফরম্যাট অনুযায়ী সেরা পদ্ধতি বেছে নেয়।'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={current.smartCompression}
              aria-label={
                lang === 'en' ? 'Toggle Smart Compression' : 'স্মার্ট কম্প্রেশন টগল'
              }
              onClick={() =>
                pushState({ ...current, smartCompression: !current.smartCompression })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                current.smartCompression ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition-transform ${
                  current.smartCompression ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Compression Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              {lang === 'en' ? 'Compression Mode' : 'কম্প্রেশন মোড'}
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
                {lang === 'en' ? 'Quality Slider' : 'কোয়ালিটি স্লাইডার'}
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
                {lang === 'en' ? 'Target File Size' : 'নির্দিষ্ট সাইজ (KB)'}
              </button>
            </div>
          </div>

          {/* PNG Lossless vs Lossy Strategy when explicit PNG is active */}
          {current.mode === 'quality' && isPngSelected && current.outputFormat !== 'smart' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                {lang === 'en' ? 'PNG Compression Type' : 'PNG কম্প্রেশন ধরন'}
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-slate-100">
                <button
                  type="button"
                  onClick={() => pushState({ ...current, pngStrategy: 'lossless' })}
                  className={`py-2 text-xs font-medium rounded-md cursor-pointer transition-colors min-h-[38px] ${
                    current.pngStrategy === 'lossless'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'en' ? 'Lossless (Exact)' : 'লসলেস (অক্ষুণ্ণ)'}
                </button>
                <button
                  type="button"
                  onClick={() => pushState({ ...current, pngStrategy: 'lossy' })}
                  className={`py-2 text-xs font-medium rounded-md cursor-pointer transition-colors min-h-[38px] ${
                    current.pngStrategy === 'lossy'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'en' ? 'Lossy (Smaller)' : 'লসি (ছোট সাইজ)'}
                </button>
              </div>
            </div>
          )}

          {/* Quality Slider OR Lossless PNG Explanation OR Target Size Controls */}
          {current.mode === 'quality' ? (
            isPngSelected &&
            current.outputFormat !== 'smart' &&
            current.pngStrategy === 'lossless' ? (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                {lang === 'en'
                  ? 'Lossless PNG preserves 100% original pixels and transparency, so a quality slider does not apply. Switch to Lossy PNG or WEBP for higher file size reduction.'
                  : 'লসলেস PNG শতভাগ আসল পিক্সেল ও স্বচ্ছতা বজায় রাখে, তাই এতে কোয়ালিটি স্লাইডার প্রযোজ্য নয়। সাইজ আরও কমাতে Lossy PNG বা WEBP ব্যবহার করুন।'}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-700">
                    {isPngSelected && current.outputFormat !== 'smart'
                      ? lang === 'en'
                        ? 'Color Precision'
                        : 'কালার প্রিসিশন'
                      : lang === 'en'
                        ? 'Quality'
                        : 'কোয়ালিটি'}
                  </span>
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
                  <span>{lang === 'en' ? 'Smallest file' : 'সবচেয়ে ছোট'}</span>
                  <span>{lang === 'en' ? 'Best quality' : 'সর্বোচ্চ মান'}</span>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  {lang === 'en' ? 'Target Size Presets (KB)' : 'টার্গেট সাইজ প্রিসেট (KB)'}
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
                  {lang === 'en' ? 'Custom Target (KB)' : 'কাস্টম টার্গেট (KB)'}
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

          {/* Output Format */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              {lang === 'en' ? 'Output Format' : 'আউটপুট ফরম্যাট'}
            </label>
            <select
              value={current.outputFormat}
              onChange={(e) =>
                pushState({
                  ...current,
                  outputFormat: e.target.value as FormatOption,
                })
              }
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
            >
              <option value="smart">
                {lang === 'en'
                  ? `Smart Auto (${shortFormatLabel(originalNormMime)} / WEBP)`
                  : `স্মার্ট অটো (${shortFormatLabel(originalNormMime)} / WEBP)`}
              </option>
              <option value="original">
                {lang === 'en'
                  ? `Keep Original (${shortFormatLabel(originalNormMime)})`
                  : `মূল ফরম্যাট রাখুন (${shortFormatLabel(originalNormMime)})`}
              </option>
              <option value="image/jpeg">
                {lang === 'en' ? 'JPG (Smallest for Photos)' : 'JPG (ছবির জন্য সবচেয়ে ছোট)'}
              </option>
              <option value="image/webp">
                {lang === 'en'
                  ? 'WEBP (Transparency + Smallest)'
                  : 'WEBP (স্বচ্ছতা + সবচেয়ে ছোট)'}
              </option>
              <option value="image/png">
                {lang === 'en' ? 'PNG (Lossless / Exact)' : 'PNG (লসলেস / আসল মান)'}
              </option>
            </select>
          </div>

          {/* Strategy & Dimensions Summary */}
          {meta && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center justify-between gap-2">
                <span>{lang === 'en' ? 'Method' : 'পদ্ধতি'}</span>
                <span className="font-medium text-slate-800 text-right">
                  {meta.compressionKind === 'lossless' ? 'Lossless' : 'Lossy'} ·{' '}
                  {shortFormatLabel(meta.resolvedMime)}
                  {meta.qualityUsed !== null ? ` (Q${meta.qualityUsed}%)` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>{t.editor.dimensions}</span>
                <span className="font-mono tabular-nums text-slate-800">
                  {meta.width} × {meta.height} px
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <DownloadButton
              onClick={handleDownload}
              disabled={!editedBlob}
              loading={processing}
              label={
                isOutputLarger || isOutputSame
                  ? lang === 'en'
                    ? 'Download Output Anyway'
                    : 'তবুও আউটপুট ডাউনলোড করুন'
                  : t.editor.download
              }
              sublabel={editedBlob ? formatBytes(editedBlob.size) : undefined}
              className="w-full"
            />

            {(isOutputLarger || isOutputSame) && (
              <button
                type="button"
                onClick={handleDownloadOriginal}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer min-h-[42px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {lang === 'en'
                    ? `Keep & Download Original (${formatBytes(image.size)})`
                    : `আসল ফাইল ডাউনলোড করুন (${formatBytes(image.size)})`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Preview Viewport & Accurate Size / Status Feedback */}
        <div className="order-1 lg:order-2 lg:col-span-8 space-y-3">
          <ImagePreview
            originalUrl={image.objectUrl}
            editedUrl={editedUrl}
            mode={previewMode}
            zoom={zoom}
            alt={image.fileName}
          />

          {/* Original / Output / Saved Percentage Strip */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs text-slate-500">{t.editor.originalSize}</div>
              <div className="mt-0.5 text-sm sm:text-base font-semibold font-mono tabular-nums text-slate-900">
                {formatBytes(image.size)}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {shortFormatLabel(originalNormMime)}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">{t.editor.outputSize}</div>
              <div
                className={`mt-0.5 text-sm sm:text-base font-semibold font-mono tabular-nums ${
                  isSuccess
                    ? 'text-blue-600'
                    : isOutputLarger || isTargetMissed
                      ? 'text-amber-700'
                      : 'text-slate-800'
                }`}
              >
                {processing
                  ? t.editor.processing
                  : editedBlob
                    ? formatBytes(editedBlob.size)
                    : '—'}
              </div>
              {meta && !processing && (
                <div className="text-[11px] text-slate-400 font-mono">
                  {shortFormatLabel(meta.resolvedMime)}
                </div>
              )}
            </div>

            <div>
              <div className="text-xs text-slate-500">
                {isOutputLarger
                  ? lang === 'en'
                    ? 'Size Increased'
                    : 'সাইজ বেড়েছে'
                  : t.editor.saved}
              </div>
              <div
                className={`mt-0.5 text-sm sm:text-base font-semibold font-mono tabular-nums ${
                  isOutputSmaller
                    ? 'text-emerald-700'
                    : isOutputLarger
                      ? 'text-amber-700'
                      : 'text-slate-600'
                }`}
              >
                {processing
                  ? '...'
                  : editedBlob
                    ? isOutputSmaller
                      ? `-${formattedPercent}%`
                      : isOutputLarger
                        ? `+${formattedPercent}%`
                        : '0.0%'
                    : '—'}
              </div>
              {editedBlob && !processing && (
                <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {isOutputSmaller
                    ? `${formatBytes(diffBytes)} ${lang === 'en' ? 'smaller' : 'কমেছে'}`
                    : isOutputLarger
                      ? `+${formatBytes(Math.abs(diffBytes))} ${lang === 'en' ? 'larger' : 'বেড়েছে'}`
                      : lang === 'en'
                        ? 'Same size'
                        : 'অপরিবর্তিত'}
                </div>
              )}
            </div>
          </div>

          {/* Honest Compression Status Banner (Green on verified savings, Amber Warning if larger or target missed) */}
          {!processing && editedBlob && meta && (
            <>
              {isSuccess ? (
                <div
                  role="status"
                  className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900 space-y-1 min-w-0">
                    <div className="font-semibold">
                      {lang === 'en'
                        ? `Compressed successfully · ${meta.strategyLabel}`
                        : `সফলভাবে কমপ্রেস হয়েছে · ${meta.strategyLabel}`}
                    </div>
                    <p className="text-emerald-800 leading-relaxed">
                      {lang === 'en'
                        ? `Reduced from ${formatBytes(image.size)} to ${formatBytes(editedBlob.size)} (${formattedPercent}% smaller)${
                            meta.smartAdjusted
                              ? meta.convertedFromPng
                                ? ' — Smart Compression switched PNG to WEBP while keeping transparency.'
                                : ` — Smart Compression tuned quality to ${meta.qualityUsed}% so the output stayed smaller than your original.`
                              : '.'
                          }`
                        : `${formatBytes(image.size)} থেকে ${formatBytes(editedBlob.size)} হয়েছে (${formattedPercent}% কমেছে)${
                            meta.smartAdjusted
                              ? meta.convertedFromPng
                                ? ' — স্মার্ট কম্প্রেশন স্বচ্ছতা অক্ষুণ্ণ রেখে PNG থেকে WEBP-তে রূপান্তর করেছে।'
                                : ` — মূল ফাইলের চেয়ে ছোট রাখতে কোয়ালিটি ${meta.qualityUsed}% এ সমন্বয় করা হয়েছে।`
                              : '।'
                          }`}
                    </p>
                  </div>
                </div>
              ) : isTargetMissed ? (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950 space-y-2.5 min-w-0 flex-1">
                    <div className="font-semibold">
                      {lang === 'en'
                        ? `Target size (${current.targetKb} KB) could not be reached`
                        : `নির্ধারিত ${current.targetKb} KB টার্গেট অর্জন করা যায়নি`}
                    </div>
                    <p className="text-amber-900 leading-relaxed">
                      {lang === 'en'
                        ? `Minimum size achieved in ${shortFormatLabel(meta.resolvedMime)} was ${formatBytes(editedBlob.size)}. ${
                            meta.resolvedMime === 'image/png'
                              ? 'PNG is a lossless-structured format and stays larger for detailed photos. Convert to WEBP or JPG to hit smaller KB targets.'
                              : 'Try increasing the target KB slightly or switching to WEBP for better compression.'
                          }`
                        : `${shortFormatLabel(meta.resolvedMime)} ফরম্যাটে সর্বনিম্ন ${formatBytes(editedBlob.size)} পাওয়া গেছে। আরও ছোট সাইজ পেতে WEBP বা JPG ফরম্যাট ব্যবহার করে দেখুন।`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {meta.resolvedMime !== 'image/webp' && (
                        <button
                          type="button"
                          onClick={() =>
                            pushState({ ...current, outputFormat: 'image/webp' })
                          }
                          className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100/70 cursor-pointer"
                        >
                          {lang === 'en' ? 'Switch to WEBP' : 'WEBP ব্যবহার করুন'}
                        </button>
                      )}
                      {meta.resolvedMime !== 'image/jpeg' && (
                        <button
                          type="button"
                          onClick={() =>
                            pushState({ ...current, outputFormat: 'image/jpeg' })
                          }
                          className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100/70 cursor-pointer"
                        >
                          {lang === 'en' ? 'Switch to JPG' : 'JPG ব্যবহার করুন'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950 space-y-2.5 min-w-0 flex-1">
                    <div className="font-semibold">
                      {isOutputLarger
                        ? lang === 'en'
                          ? `Output file is +${formattedPercent}% larger than original`
                          : `আউটপুট ফাইল মূল ফাইলের চেয়ে +${formattedPercent}% বড় হয়েছে`
                        : lang === 'en'
                          ? 'No further size reduction at current settings'
                          : 'বর্তমান সেটিংসে ফাইলের সাইজ কমেনি'}
                    </div>
                    <p className="text-amber-900 leading-relaxed">
                      {meta.resolvedMime === 'image/png'
                        ? lang === 'en'
                          ? 'Your PNG image is already tightly optimized. Lossless PNG re-encoding inside the browser often increases file size. Switch to WEBP (preserves transparency) or Lossy PNG to shrink it.'
                          : 'আপনার PNG ছবিটি ইতিমধ্যেই ভালোভাবে অপ্টিমাইজ করা। ব্রাউজারে লসলেস PNG পুনরায় সেভ করলে সাইজ বাড়তে পারে। কমাতে চাইলে WEBP (স্বচ্ছতা অক্ষুণ্ণ রাখে) বা Lossy PNG ব্যবহার করুন।'
                        : lang === 'en'
                          ? `Your original ${shortFormatLabel(originalNormMime)} (${formatBytes(image.size)}) is already well-compressed below this quality level. Lower the quality slider or switch to WEBP for a smaller output.`
                          : `আপনার মূল ${shortFormatLabel(originalNormMime)} (${formatBytes(image.size)}) ইতিমধ্যেই এই কোয়ালিটির চেয়ে বেশি কমপ্রেস করা। সাইজ কমাতে কোয়ালিটি আরও কমান অথবা WEBP ফরম্যাট বেছে নিন।`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {meta.resolvedMime === 'image/png' &&
                        current.pngStrategy === 'lossless' && (
                          <button
                            type="button"
                            onClick={() =>
                              pushState({
                                ...current,
                                outputFormat: 'image/png',
                                pngStrategy: 'lossy',
                                quality: 65,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100/70 cursor-pointer"
                          >
                            {lang === 'en' ? 'Try Lossy PNG' : 'Lossy PNG ব্যবহার করুন'}
                          </button>
                        )}
                      {meta.resolvedMime !== 'image/webp' && (
                        <button
                          type="button"
                          onClick={() =>
                            pushState({
                              ...current,
                              outputFormat: 'image/webp',
                              quality: Math.min(current.quality, 75),
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100/70 cursor-pointer"
                        >
                          {lang === 'en'
                            ? 'Convert to WEBP (Recommended)'
                            : 'WEBP-তে রূপান্তর করুন (প্রস্তাবিত)'}
                        </button>
                      )}
                      {meta.resolvedMime !== 'image/jpeg' && !meta.hasTransparency && (
                        <button
                          type="button"
                          onClick={() =>
                            pushState({
                              ...current,
                              outputFormat: 'image/jpeg',
                              quality: Math.min(current.quality, 75),
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100/70 cursor-pointer"
                        >
                          {lang === 'en' ? 'Convert to JPG' : 'JPG ব্যবহার করুন'}
                        </button>
                      )}
                      {(!isPngSelected || current.pngStrategy === 'lossy') &&
                        current.quality > 30 && (
                          <button
                            type="button"
                            onClick={handleFitBelowOriginal}
                            className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100/70 cursor-pointer"
                          >
                            {lang === 'en'
                              ? `Optimize Below ${formatBytes(image.size)}`
                              : `${formatBytes(image.size)}-এর নিচে অপ্টিমাইজ করুন`}
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
