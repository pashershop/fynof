import React, { useEffect, useState } from 'react';
import { Check, Download, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DownloadButtonProps {
  onClick: () => boolean | void | Promise<boolean | void>;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  label,
  sublabel,
  className = '',
}) => {
  const { t } = useApp();
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!downloaded) return;
    const timer = setTimeout(() => setDownloaded(false), 2200);
    return () => clearTimeout(timer);
  }, [downloaded]);

  const handlePress = async () => {
    const result = await onClick();
    if (result !== false) {
      setDownloaded(true);
    }
  };

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={handlePress}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer min-h-[44px] whitespace-nowrap ${className}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : downloaded ? (
          <Check className="w-4 h-4 shrink-0" />
        ) : (
          <Download className="w-4 h-4 shrink-0" />
        )}
        <span>
          {loading
            ? t.editor.processing
            : downloaded
            ? 'Saved to device'
            : label || t.editor.download}
        </span>
        {sublabel && !loading && !downloaded && (
          <span className="text-xs font-mono font-normal opacity-90 tabular-nums">
            ({sublabel})
          </span>
        )}
      </button>
    </div>
  );
};
