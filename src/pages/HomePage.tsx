import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  Infinity as InfinityIcon,
  Lock,
  ShieldCheck,
  Sparkles,
  Upload,
  UserX,
  X,
} from 'lucide-react';
import { AdPlaceholder } from '../components/AdPlaceholder';
import { SEOHead } from '../components/SEOHead';
import { ToolCard } from '../components/ToolCard';
import { ToolIcon } from '../components/ToolIcon';
import { useApp } from '../context/AppContext';
import { CATEGORIES, HOMEPAGE_FAQS, TOOLS, getToolById } from '../data/tools';
import { formatBytes, validateImageFile } from '../utils/canvasUtils';
import { ToolDefinition } from '../types/tool';

export const HomePage: React.FC = () => {
  const { lang, t, loadSharedFile, sharedImage, recentToolIds } = useApp();
  const navigate = useNavigate();
  const heroInputRef = useRef<HTMLInputElement>(null);

  const [chooserOpen, setChooserOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draggingHero, setDraggingHero] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const popularTools = TOOLS.filter((tool) => tool.popular);
  const singleImageTools = TOOLS.filter((tool) => tool.supportsWorkspaceImage);
  const recentTools = recentToolIds
    .map((id) => getToolById(id))
    .filter((item): item is ToolDefinition => Boolean(item));

  const handleHeroFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    const validationError = validateImageFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    try {
      await loadSharedFile(file, file.name);
      setChooserOpen(true);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t.editor.errorInvalidFile);
    }
  };

  const whyIcons = [Sparkles, UserX, ShieldCheck, InfinityIcon];

  return (
    <>
      <SEOHead
        title="Fynof – Free Online Photo Editing & Image Tools"
        description="Free online image tools to resize, compress, convert, crop and edit your photos. No signup, no limits. 100% browser-based privacy."
        canonicalPath="/"
      />

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-11 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <h1 className="text-[clamp(1.9rem,4.3vw,3.3rem)] font-extrabold tracking-[-0.028em] text-slate-950 leading-[1.09] text-balance max-w-2xl">
                {t.hero.heading}
              </h1>

              <p className="text-[15.5px] sm:text-[17px] text-slate-600 leading-[1.7] max-w-xl">
                {t.hero.description}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                <input
                  ref={heroInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleHeroFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => heroInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.99] shadow-[0_1px_2px_rgba(37,99,235,0.2),0_4px_12px_-2px_rgba(37,99,235,0.18)] transition-all duration-150 cursor-pointer min-h-[46px] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <Upload className="w-4 h-4 shrink-0" />
                  <span>{t.hero.uploadBtn}</span>
                </button>

                <Link
                  to="/all-tools"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 hover:text-slate-950 transition-all duration-150 min-h-[46px] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                >
                  <span>{t.hero.exploreBtn}</span>
                  <ArrowRight className="w-4 h-4 shrink-0 text-slate-500" />
                </Link>
              </div>

              {uploadError && (
                <p className="text-xs font-medium text-red-600" role="alert">
                  {uploadError}
                </p>
              )}

              <div className="flex items-start sm:items-center gap-2 text-xs sm:text-[13px] text-slate-500 pt-0.5">
                <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
                <span>{t.hero.privacyLine}</span>
              </div>
            </div>

            {/* Interactive Quick-Drop Studio Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)]">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDraggingHero(true);
                  }}
                  onDragLeave={() => setDraggingHero(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDraggingHero(false);
                    handleHeroFile(e.dataTransfer.files?.[0]);
                  }}
                  onClick={() => heroInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      heroInputRef.current?.click();
                    }
                  }}
                  className={`group rounded-xl border-[1.5px] border-dashed px-4 py-6 sm:px-6 sm:py-8 text-center cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    draggingHero
                      ? 'border-blue-600 bg-blue-50/70'
                      : 'border-slate-300/90 bg-slate-50/75 hover:border-blue-500 hover:bg-blue-50/35'
                  }`}
                >
                  <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 flex items-center justify-center mb-3.5 transition-transform duration-150 group-hover:-translate-y-0.5">
                    <Upload className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <p className="text-[15px] font-semibold text-slate-900">
                    {t.editor.dropTitle}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {t.editor.dropSubtitle}
                  </p>
                  <p className="mt-3 text-[11px] font-medium text-slate-500 font-mono">
                    JPG · PNG · WEBP · Up to 25 MB
                  </p>
                </div>

                {/* Clean Statistics Strip */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-200/80 text-center">
                  <div className="px-2 py-1">
                    <div className="text-[11px] font-medium text-slate-500">
                      {lang === 'en' ? 'Tools' : 'টুলস'}
                    </div>
                    <div className="mt-0.5 text-[13px] sm:text-sm font-bold font-mono tabular-nums tracking-tight text-slate-900 whitespace-nowrap">
                      {lang === 'en' ? '15 Free' : '১৫টি ফ্রি'}
                    </div>
                  </div>
                  <div className="px-2 py-1">
                    <div className="text-[11px] font-medium text-slate-500">
                      {lang === 'en' ? 'Server' : 'সার্ভার'}
                    </div>
                    <div className="mt-0.5 text-[13px] sm:text-sm font-bold font-mono tabular-nums tracking-tight text-slate-900 whitespace-nowrap">
                      {lang === 'en' ? '0 Uploads' : '০ আপলোড'}
                    </div>
                  </div>
                  <div className="px-2 py-1">
                    <div className="text-[11px] font-medium text-slate-500">
                      {lang === 'en' ? 'Signup' : 'সাইনআপ'}
                    </div>
                    <div className="mt-0.5 text-[13px] sm:text-sm font-bold font-mono tabular-nums tracking-tight text-slate-900 whitespace-nowrap">
                      {lang === 'en' ? 'None' : 'নেই'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Used Tools */}
      {recentTools.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-9 sm:pt-11 pb-1">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {lang === 'en' ? 'Recently Used Tools' : 'সাম্প্রতিক ব্যবহৃত টুলস'}
            </h2>
            <Link
              to="/all-tools"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap shrink-0"
            >
              <span>{t.sections.viewAllTools}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Tools */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-11 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {t.sections.popularTools}
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600">
              {t.sections.popularSubtitle}
            </p>
          </div>
          <Link
            to="/all-tools"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap shrink-0"
          >
            <span>{t.sections.viewAllTools}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Browse Categories */}
      <section className="bg-slate-50 border-y border-slate-200 py-11 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {t.sections.browseCategories}
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600">
              {t.sections.categoriesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat) => {
              const catTools = TOOLS.filter((item) => item.category === cat.id);
              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {cat.name[lang]}
                      </h3>
                      <span className="text-xs font-mono tabular-nums text-slate-500">
                        {catTools.length} tools
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {cat.description[lang]}
                    </p>
                    <ul className="space-y-1.5 mb-5">
                      {catTools.map((item) => (
                        <li key={item.id}>
                          <Link
                            to={`/${item.slug}`}
                            className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-blue-600 transition-colors"
                          >
                            <ToolIcon name={item.iconName} className="w-3.5 h-3.5 text-blue-600" />
                            <span>{item.name[lang]}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to={`/all-tools?cat=${cat.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 pt-3 border-t border-slate-100"
                  >
                    <span>Explore {cat.name[lang]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mid-page Advertisement Placeholder */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <AdPlaceholder slotId="home-middle" variant="banner" />
      </div>

      {/* Why Choose Fynof */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-11 sm:py-12">
        <div className="max-w-2xl mb-7">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {t.sections.whyChooseTitle}
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600">
            {t.sections.whyChooseSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.whyChoose.map((item, idx) => {
            const Icon = whyIcons[idx] || ShieldCheck;
            return (
              <div
                key={item.title}
                className="p-5 rounded-xl bg-white border border-slate-200 space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 border-y border-slate-200 py-11 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {t.sections.howItWorksTitle}
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600">
              {t.sections.howItWorksSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {t.howItWorks.map((step) => (
              <div
                key={step.step}
                className="p-6 rounded-xl bg-white border border-slate-200 space-y-2.5"
              >
                <div className="text-sm font-mono font-bold text-blue-600">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-11 sm:py-12">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {t.sections.faqTitle}
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600">
            {t.sections.faqSubtitle}
          </p>
        </div>

        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white">
          {HOMEPAGE_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm sm:text-base font-semibold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
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

      {/* Pre-Footer Advertisement Placeholder */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdPlaceholder slotId="home-prefooter" variant="banner" />
      </div>

      {/* Choose Tool Modal after Hero Image Upload */}
      {chooserOpen && sharedImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setChooserOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={sharedImage.objectUrl}
                  alt={sharedImage.fileName}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 truncate">
                    {t.hero.chooseToolTitle}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono tabular-nums truncate">
                    {sharedImage.fileName} · {sharedImage.width}×{sharedImage.height} ·{' '}
                    {formatBytes(sharedImage.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChooserOpen(false)}
                aria-label="Close"
                className="w-10 h-10 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[65vh] overflow-y-auto">
              <p className="text-xs text-slate-600 mb-3">{t.hero.chooseToolSubtitle}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {singleImageTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      setChooserOpen(false);
                      navigate(`/${tool.slug}`);
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 text-left transition-colors cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-blue-600 flex items-center justify-center shrink-0">
                      <ToolIcon name={tool.iconName} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {tool.name[lang]}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {tool.formatsLabel}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
