import React from 'react';
import { useApp } from '../context/AppContext';

interface AdPlaceholderProps {
  slotId: string;
  variant?: 'banner' | 'section';
  className?: string;
}

/**
 * Clean reserved container for future Monetag integration.
 * Contains no fake ads, no fake earnings, and sits well away from interactive editor buttons.
 */
export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
  slotId,
  variant = 'banner',
  className = '',
}) => {
  const { t } = useApp();

  return (
    <aside
      aria-label={t.sections.advertisement}
      data-ad-slot={slotId}
      className={`w-full rounded-xl border border-dashed border-slate-200 bg-slate-50/70 flex flex-col items-center justify-center text-center px-4 ${
        variant === 'banner' ? 'min-h-[96px] py-4' : 'min-h-[120px] py-6'
      } ${className}`}
    >
      <span className="text-[11px] font-medium text-slate-400 tracking-wide">
        {t.sections.advertisement}
      </span>
      <span className="text-xs text-slate-400 mt-0.5">
        Monetag Ad Slot · {slotId}
      </span>
    </aside>
  );
};
