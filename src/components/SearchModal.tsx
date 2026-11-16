import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOOLS } from '../data/tools';
import { ToolIcon } from './ToolIcon';

export const SearchModal: React.FC = () => {
  const { searchOpen, setSearchOpen, lang, t } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, setSearchOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.filter(
      (tool) =>
        tool.name.en.toLowerCase().includes(q) ||
        tool.name.bn.toLowerCase().includes(q) ||
        tool.shortDesc.en.toLowerCase().includes(q) ||
        tool.shortDesc.bn.toLowerCase().includes(q) ||
        tool.formatsLabel.toLowerCase().includes(q)
    );
  }, [query]);

  if (!searchOpen) return null;

  const handleSelect = (slug: string) => {
    setSearchOpen(false);
    navigate(`/${slug}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[1px] flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={() => setSearchOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label={t.nav.searchTitle}
    >
      <div
        className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filtered.length > 0) {
                handleSelect(filtered[0].slug);
              }
            }}
            placeholder={t.nav.searchPlaceholder}
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">{t.nav.noResults}</p>
          ) : (
            filtered.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleSelect(tool.slug)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-blue-600 flex items-center justify-center shrink-0">
                    <ToolIcon name={tool.iconName} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {tool.name[lang]}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{tool.shortDesc[lang]}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
