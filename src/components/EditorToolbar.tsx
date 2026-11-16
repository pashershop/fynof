import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft,
  Redo2,
  RotateCcw,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOOLS } from '../data/tools';
import { PreviewMode } from './ImagePreview';

interface EditorToolbarProps {
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onReset: () => void;
  onClearImage: () => void;
  mode?: PreviewMode;
  onModeChange?: (mode: PreviewMode) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showCompare?: boolean;
  currentToolId: string;
  onSendToTool?: () => Promise<Blob | null>;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onReset,
  onClearImage,
  mode,
  onModeChange,
  zoom,
  onZoomChange,
  showCompare = true,
  currentToolId,
  onSendToTool,
}) => {
  const { lang, t, loadSharedFile } = useApp();
  const navigate = useNavigate();
  const [transferOpen, setTransferOpen] = useState(false);
  const transferRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!transferOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (transferRef.current && !transferRef.current.contains(e.target as Node)) {
        setTransferOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTransferOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [transferOpen]);

  const compatibleTools = TOOLS.filter(
    (tool) => tool.supportsWorkspaceImage && tool.id !== currentToolId
  );

  const handleTransfer = async (slug: string) => {
    setTransferOpen(false);
    if (onSendToTool) {
      const blob = await onSendToTool();
      if (blob) {
        await loadSharedFile(blob, `fynof-edited.${blob.type.split('/')[1] || 'png'}`);
      }
    }
    navigate(`/${slug}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
      {/* History & Reset */}
      <div className="flex flex-wrap items-center gap-1.5">
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title={t.editor.undo}
            aria-label={t.editor.undo}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[40px]"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.editor.undo}</span>
          </button>
        )}

        {onRedo && (
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title={t.editor.redo}
            aria-label={t.editor.redo}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[40px]"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.editor.redo}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          title={t.editor.reset}
          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer min-h-[40px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.editor.reset}</span>
        </button>

        <button
          type="button"
          onClick={onClearImage}
          title={t.editor.changeImage}
          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:text-red-600 hover:border-red-200 cursor-pointer min-h-[40px]"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.editor.changeImage}</span>
        </button>
      </div>

      {/* View Mode Switcher */}
      {mode && onModeChange && (
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200/70">
          <button
            type="button"
            onClick={() => onModeChange('edited')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer min-h-[34px] ${
              mode === 'edited'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.editor.edited}
          </button>
          <button
            type="button"
            onClick={() => onModeChange('original')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer min-h-[34px] ${
              mode === 'original'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.editor.original}
          </button>
          {showCompare && (
            <button
              type="button"
              onClick={() => onModeChange('compare')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer min-h-[34px] ${
                mode === 'compare'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.editor.compare}
            </button>
          )}
        </div>
      )}

      {/* Zoom & Cross-Tool Transfer */}
      <div className="flex items-center gap-1.5 relative">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(0.25, Number((zoom - 0.25).toFixed(2))))}
          aria-label={t.editor.zoomOut}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onZoomChange(1)}
          className="px-2 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono tabular-nums text-slate-700 hover:bg-slate-100 cursor-pointer min-h-[40px]"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(3, Number((zoom + 0.25).toFixed(2))))}
          aria-label={t.editor.zoomIn}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {onSendToTool && (
          <div className="relative" ref={transferRef}>
            <button
              type="button"
              onClick={() => setTransferOpen((v) => !v)}
              aria-expanded={transferOpen}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-blue-400 hover:text-blue-600 cursor-pointer min-h-[40px]"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.editor.openInAnotherTool}</span>
            </button>
            {transferOpen && (
              <div className="absolute right-0 mt-1.5 w-60 max-w-[calc(100vw-2rem)] max-h-72 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-lg z-30 py-1.5">
                {compatibleTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleTransfer(tool.slug)}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 cursor-pointer"
                  >
                    {tool.name[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
