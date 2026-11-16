import React, { useEffect, useState } from 'react';
import { Check, Copy, RotateCcw } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { UploadArea } from '../components/UploadArea';
import { useActiveToolImage, useEditedObjectUrl } from '../hooks/useSingleImageTool';
import {
  canvasToBlob,
  downloadBlob,
  formatBytes,
  getExtensionForMime,
  loadImageFromUrl,
  stripExtension,
} from '../utils/canvasUtils';

export const Base64Tool: React.FC = () => {
  const { image, error, setError, handleUpload, useWorkspaceImage, clearImage } =
    useActiveToolImage();
  const { editedUrl, editedBlob, setOutput } = useEditedObjectUrl();

  const [tab, setTab] = useState<'encode' | 'decode'>('encode');
  const [dataUri, setDataUri] = useState('');
  const [includePrefix, setIncludePrefix] = useState(true);
  const [copied, setCopied] = useState(false);

  const [decodeInput, setDecodeInput] = useState('');
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [decodeFormat, setDecodeFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>(
    'image/png'
  );
  const [decodedDim, setDecodedDim] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!image) {
      setDataUri('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDataUri(reader.result);
      }
    };
    reader.onerror = () => setError('Failed to encode image to Base64.');
    reader.readAsDataURL(image.blob);
  }, [image, setError]);

  useEffect(() => {
    if (tab !== 'decode') return;
    const raw = decodeInput.trim();
    if (!raw) {
      setOutput(null);
      setDecodedDim(null);
      setDecodeError(null);
      return;
    }

    if (raw.length > 35_000_000) {
      setDecodeError('Input string is too large to decode safely in browser.');
      return;
    }

    let cancelled = false;
    const decode = async () => {
      setDecodeError(null);
      try {
        let normalized = raw;
        if (!raw.startsWith('data:image/')) {
          const clean = raw.replace(/\s+/g, '');
          if (!/^[A-Za-z0-9+/=]+$/.test(clean)) {
            throw new Error('Invalid Base64 characters detected.');
          }
          let guessed = 'image/png';
          if (clean.startsWith('/9j/')) guessed = 'image/jpeg';
          else if (clean.startsWith('UklGR')) guessed = 'image/webp';
          else if (clean.startsWith('R0lGOD')) guessed = 'image/gif';
          normalized = `data:${guessed};base64,${clean}`;
        }

        const img = await loadImageFromUrl(normalized);
        if (cancelled) return;
        setDecodedDim({ w: img.naturalWidth, h: img.naturalHeight });

        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d')!;
        if (decodeFormat === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, c.width, c.height);
        }
        ctx.drawImage(img, 0, 0);
        const blob = await canvasToBlob(c, decodeFormat, 0.94);
        if (!cancelled) setOutput(blob);
      } catch (err) {
        if (!cancelled) {
          setOutput(null);
          setDecodedDim(null);
          setDecodeError(
            err instanceof Error
              ? err.message
              : 'Invalid Base64 image string. Please verify the encoded input.'
          );
        }
      }
    };

    const timer = setTimeout(decode, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tab, decodeInput, decodeFormat, setOutput]);

  const displayedBase64 = includePrefix ? dataUri : dataUri.split(',')[1] || '';

  const handleCopy = async () => {
    if (!displayedBase64) return;
    try {
      await navigator.clipboard.writeText(displayedBase64);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Clipboard permission denied. Select the text box and copy manually.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="inline-flex p-1 rounded-lg bg-slate-100">
        <button
          type="button"
          onClick={() => setTab('encode')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md cursor-pointer transition-colors min-h-[40px] ${
            tab === 'encode' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Image to Base64
        </button>
        <button
          type="button"
          onClick={() => setTab('decode')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md cursor-pointer transition-colors min-h-[40px] ${
            tab === 'decode' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Base64 to Image
        </button>
      </div>

      {tab === 'encode' ? (
        !image ? (
          <UploadArea
            accept="image/jpeg,image/png,image/webp"
            onFilesSelected={handleUpload}
            supportedText="Supports JPG, PNG, WEBP"
            errorMessage={error}
            allowWorkspaceReuse
            onUseWorkspaceImage={useWorkspaceImage}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {image.fileName}
                </span>
                <button
                  type="button"
                  onClick={clearImage}
                  className="text-xs font-medium text-red-600 hover:underline cursor-pointer"
                >
                  Change Image
                </button>
              </div>
              <div className="checkerboard-bg rounded-lg border border-slate-200 p-3 flex items-center justify-center">
                <img
                  src={image.objectUrl}
                  alt={image.fileName}
                  className="max-h-64 w-auto object-contain rounded"
                />
              </div>
              <div className="flex justify-between text-xs font-mono tabular-nums text-slate-600">
                <span>
                  {image.width} × {image.height} px
                </span>
                <span>{formatBytes(image.size)}</span>
              </div>
            </div>

            <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePrefix}
                    onChange={(e) => setIncludePrefix(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Include Data URI prefix (data:image/...;base64,)</span>
                </label>
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  {displayedBase64.length.toLocaleString()} chars
                </span>
              </div>

              <textarea
                readOnly
                value={displayedBase64}
                rows={10}
                aria-label="Encoded Base64 output"
                className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 focus:outline-none"
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 cursor-pointer min-h-[44px]"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Base64!' : 'Copy Base64'}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (dataUri) {
                      try {
                        await navigator.clipboard.writeText(
                          `<img src="${dataUri}" alt="${stripExtension(image.fileName)}" />`
                        );
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1800);
                      } catch {
                        // ignore
                      }
                    }
                  }}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer min-h-[44px]"
                >
                  Copy HTML &lt;img&gt;
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Paste Base64 String or Data URI
              </label>
              {decodeInput && (
                <button
                  type="button"
                  onClick={() => setDecodeInput('')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
            <textarea
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
              rows={10}
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {decodeError && (
              <p className="text-xs text-red-600" role="alert">
                {decodeError}
              </p>
            )}
          </div>

          <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-slate-200 space-y-4">
            <div className="text-xs font-semibold text-slate-700">Decoded Image Preview</div>
            <div className="min-h-[220px] rounded-lg border border-slate-200 checkerboard-bg flex items-center justify-center p-4">
              {editedUrl ? (
                <img
                  src={editedUrl}
                  alt="Decoded Base64 Preview"
                  className="max-h-60 w-auto object-contain rounded"
                />
              ) : (
                <span className="text-xs text-slate-400">Preview will appear here</span>
              )}
            </div>

            {decodedDim && editedBlob && (
              <div className="flex justify-between text-xs font-mono tabular-nums text-slate-600">
                <span>
                  {decodedDim.w} × {decodedDim.h} px
                </span>
                <span>{formatBytes(editedBlob.size)}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Download Format
              </label>
              <select
                value={decodeFormat}
                onChange={(e) =>
                  setDecodeFormat(
                    e.target.value as 'image/png' | 'image/jpeg' | 'image/webp'
                  )
                }
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm min-h-[44px]"
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/webp">WEBP</option>
              </select>
            </div>

            <DownloadButton
              onClick={() => {
                if (!editedBlob) return false;
                const ext = getExtensionForMime(decodeFormat);
                return downloadBlob(editedBlob, `fynof-decoded.${ext}`);
              }}
              disabled={!editedBlob}
              label="Download Converted Image"
              sublabel={editedBlob ? formatBytes(editedBlob.size) : undefined}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
