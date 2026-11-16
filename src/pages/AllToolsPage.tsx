import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AdPlaceholder } from '../components/AdPlaceholder';
import { SEOHead } from '../components/SEOHead';
import { ToolCard } from '../components/ToolCard';
import { useApp } from '../context/AppContext';
import { CATEGORIES, TOOLS } from '../data/tools';
import { ToolCategoryId } from '../types/tool';

export const AllToolsPage: React.FC = () => {
  const { lang } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = (searchParams.get('cat') as ToolCategoryId | 'all') || 'all';
  const [query, setQuery] = useState('');

  const handleCatChange = (cat: ToolCategoryId | 'all') => {
    if (cat === 'all') setSearchParams({});
    else setSearchParams({ cat });
  };

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      if (activeCat !== 'all' && tool.category !== activeCat) return false;
      if (!q) return true;
      return (
        tool.name.en.toLowerCase().includes(q) ||
        tool.name.bn.toLowerCase().includes(q) ||
        tool.shortDesc.en.toLowerCase().includes(q) ||
        tool.shortDesc.bn.toLowerCase().includes(q) ||
        tool.formatsLabel.toLowerCase().includes(q)
      );
    });
  }, [activeCat, query]);

  return (
    <>
      <SEOHead
        title="All 15 Free Online Image & PDF Tools | Fynof"
        description="Browse all 15 free client-side image editing and PDF tools on Fynof: Compressor, Resizer, Converter, Cropper, Passport Photo Maker, NID Resizer, and more."
        canonicalPath="/all-tools"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="max-w-2xl mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {lang === 'en' ? 'All Image & PDF Tools' : 'সকল ইমেজ ও পিডিএফ টুলস'}
          </h1>
          <p className="mt-2 text-base text-slate-600">
            {lang === 'en'
              ? '15 fast, browser-based utilities with zero file uploads and no account required.'
              : '১৫টি দ্রুত এবং নিরাপদ ব্রাউজার-ভিত্তিক টুলস; কোনো ফাইল সার্ভারে আপলোড হয় না।'}
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100">
            <button
              type="button"
              onClick={() => handleCatChange('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                activeCat === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? 'All (15)' : 'সবগুলো (১৫)'}
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCatChange(cat.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                  activeCat === cat.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.name[lang]}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Filter tools...' : 'টুল খুঁজুন...'}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {filteredTools.length === 0 ? (
          <div className="py-16 text-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
            {lang === 'en' ? 'No tools matched your filter.' : 'কোনো টুল পাওয়া যায়নি।'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        <div className="mt-12">
          <AdPlaceholder slotId="all-tools-prefooter" variant="banner" />
        </div>
      </div>
    </>
  );
};
