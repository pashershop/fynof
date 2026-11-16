import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getToolById } from '../data/tools';
import { ToolDefinition } from '../types/tool';
import { AdPlaceholder } from './AdPlaceholder';
import { SEOHead } from './SEOHead';
import { ToolCard } from './ToolCard';

interface ToolPageShellProps {
  tool: ToolDefinition;
  children: React.ReactNode;
}

export const ToolPageShell: React.FC<ToolPageShellProps> = ({ tool, children }) => {
  const { lang, t, recordToolVisit } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const category = CATEGORIES.find((c) => c.id === tool.category);

  useEffect(() => {
    recordToolVisit(tool.id);
  }, [tool.id, recordToolVisit]);

  const relatedTools = tool.relatedIds
    .map((id) => getToolById(id))
    .filter((item): item is ToolDefinition => Boolean(item));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${tool.name.en} – Fynof`,
    url: `https://fynof.pages.dev/${tool.slug}`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    description: tool.seoDescription,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <SEOHead
        title={tool.seoTitle}
        description={tool.seoDescription}
        canonicalPath={`/${tool.slug}`}
        jsonLd={jsonLd}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            {t.nav.home}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/all-tools?cat=${tool.category}`} className="hover:text-blue-600 transition-colors">
            {category ? category.name[lang] : tool.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-medium truncate">{tool.name[lang]}</span>
        </nav>

        {/* Tool Header */}
        <div className="max-w-3xl mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {tool.name[lang]}
          </h1>
          <p className="mt-2 text-base text-slate-600 leading-relaxed">
            {tool.description[lang]}
          </p>
        </div>

        {/* Active Tool Workspace */}
        <section aria-label={tool.name[lang]}>{children}</section>

        {/* Ad Placeholder safely separated below the editor */}
        <div className="mt-12">
          <AdPlaceholder slotId={`tool-bottom-${tool.slug}`} variant="banner" />
        </div>

        {/* How to Use Section */}
        <section className="mt-14 pt-10 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">{t.sections.howToUse}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tool.howToSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="text-xs font-mono font-semibold text-blue-600 mb-2">
                  0{idx + 1}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{step[lang]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tool FAQ Section */}
        {tool.faqs.length > 0 && (
          <section className="mt-12 pt-10 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{t.sections.faqTitle}</h2>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white">
              {tool.faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span>{faq.question[lang]}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-150 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                        {faq.answer[lang]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section className="mt-12 pt-10 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{t.sections.relatedTools}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedTools.map((rel) => (
                <ToolCard key={rel.id} tool={rel} />
              ))}
            </div>
          </section>
        )}

        {/* Pre-Footer Advertisement Placeholder */}
        <div className="mt-12">
          <AdPlaceholder slotId={`tool-prefooter-${tool.slug}`} variant="banner" />
        </div>
      </div>
    </>
  );
};
