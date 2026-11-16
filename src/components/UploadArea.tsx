import React, { useRef, useState } from 'react';
import { AlertCircle, History, ImagePlus, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatBytes } from '../utils/canvasUtils';

interface UploadAreaProps {
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  supportedText?: string;
  maxSizeText?: string;
  errorMessage?: string | null;
  allowWorkspaceReuse?: boolean;
  onUseWorkspaceImage?: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  accept = 'image/jpeg,image/png,image/webp,image/*',
  multiple = false,
  onFilesSelected,
  supportedText,
  maxSizeText = 'Max recommended: 25 MB',
  errorMessage,
  allowWorkspaceReuse = false,
  onUseWorkspaceImage,
}) => {
  const { t, sharedImage } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    onFilesSelected(Array.from(fileList));
  };

  return (
    <div className="space-y-4">
      {allowWorkspaceReuse && sharedImage && onUseWorkspaceImage && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={sharedImage.objectUrl}
              alt={sharedImage.fileName}
              className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {sharedImage.fileName}
              </p>
              <p className="text-xs text-slate-500 font-mono tabular-nums">
                {sharedImage.width}×{sharedImage.height} · {formatBytes(sharedImage.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onUseWorkspaceImage}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] w-full sm:w-auto"
          >
            <History className="w-4 h-4" />
            <span>{t.editor.usePreviousImage}</span>
          </button>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`relative rounded-xl border-2 border-dashed p-7 sm:p-12 text-center cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
          dragging
            ? 'border-blue-600 bg-blue-50/50'
            : 'border-slate-300 bg-slate-50/60 hover:border-blue-500 hover:bg-slate-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        <div className="mx-auto w-12 h-12 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center mb-4">
          {multiple ? <ImagePlus className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
        </div>

        <h2 className="text-base sm:text-lg font-semibold text-slate-900">{t.editor.dropTitle}</h2>
        <p className="mt-1 text-sm text-slate-600">{t.editor.dropSubtitle}</p>

        <div className="mt-5">
          <span className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors min-h-[44px]">
            {t.editor.browseFiles}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <span>{supportedText || t.editor.supportedFormats}</span>
          <span aria-hidden="true">·</span>
          <span>{maxSizeText}</span>
          <span aria-hidden="true">·</span>
          <span>{t.editor.privacyNote}</span>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
