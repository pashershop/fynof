import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export type PreviewMode = 'edited' | 'original' | 'compare';

interface ImagePreviewProps {
  originalUrl: string;
  editedUrl: string | null;
  mode: PreviewMode;
  zoom: number;
  alt?: string;
  checkerboard?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  originalUrl,
  editedUrl,
  mode,
  zoom,
  alt = 'Preview',
  checkerboard = true,
}) => {
  const { t } = useApp();
  const [splitPos, setSplitPos] = useState(50);

  const activeEdited = editedUrl || originalUrl;
  const scaleStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: 'center center',
  };

  return (
    <div
      className={`relative w-full min-h-[280px] sm:min-h-[380px] max-h-[540px] rounded-xl border border-slate-200 overflow-auto flex items-center justify-center p-4 ${
        checkerboard ? 'checkerboard-bg' : 'bg-slate-100'
      }`}
    >
      {mode === 'compare' && editedUrl ? (
        <div
          className="relative inline-block select-none max-w-full overflow-hidden rounded-md shadow-xs"
          style={scaleStyle}
        >
          <img
            src={activeEdited}
            alt={alt}
            className="block max-h-[460px] w-auto object-contain pointer-events-none"
          />
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}
          >
            <img
              src={originalUrl}
              alt={`${alt} original`}
              className="block max-h-[460px] w-auto object-contain"
            />
          </div>

          <div
            className="absolute inset-y-0 w-0.5 bg-blue-600 pointer-events-none"
            style={{ left: `${splitPos}%` }}
          >
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow">
              ⇄
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={splitPos}
            aria-label="Before and after comparison slider"
            onChange={(e) => setSplitPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
          />

          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/75 text-white text-[11px] font-medium pointer-events-none">
            {t.editor.before}
          </span>
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-blue-600/90 text-white text-[11px] font-medium pointer-events-none">
            {t.editor.after}
          </span>
        </div>
      ) : (
        <div className="relative inline-block" style={scaleStyle}>
          <img
            src={mode === 'original' ? originalUrl : activeEdited}
            alt={alt}
            className="block max-h-[460px] max-w-full w-auto object-contain rounded-md"
          />
        </div>
      )}
    </div>
  );
};
