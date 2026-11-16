import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Globe, Menu, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { lang, toggleLang, t, setSearchOpen } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors duration-150 ${
      isActive
        ? 'text-blue-600 border-blue-600'
        : 'text-slate-600 border-transparent hover:text-slate-950 hover:border-slate-300'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[42px] flex items-center ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold'
        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-[60px] flex items-center justify-between gap-3 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-lg py-1"
          onClick={() => setMobileOpen(false)}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect width="28" height="28" rx="7" fill="#2563EB" />
            <path
              d="M8.5 8.5H19.5V11.5H11.8V13.6H18V16.5H11.8V20.5H8.5V8.5Z"
              fill="#FFFFFF"
            />
            <rect x="16.5" y="17.5" width="3.5" height="3.5" rx="0.75" fill="#93C5FD" />
          </svg>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-950">
            Fynof
          </span>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          <NavLink to="/" end className={navLinkClass}>
            {t.nav.home}
          </NavLink>
          <NavLink to="/all-tools" className={navLinkClass}>
            {t.nav.allTools}
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            {t.nav.about}
          </NavLink>
        </nav>

        {/* Zone 3: Search, Language & Menu Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t.nav.searchTitle}
            title={`${t.nav.searchTitle} (/)`}
            className="inline-flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-950 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleLang}
            aria-label="Switch Language"
            className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-9 px-2.5 sm:px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-950 transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{lang === 'en' ? 'EN' : 'বাংলা'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle Menu"
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {mobileOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-slate-200 bg-white px-4 py-2.5 space-y-1 shadow-sm"
        >
          <NavLink
            to="/"
            end
            onClick={() => setMobileOpen(false)}
            className={mobileNavLinkClass}
          >
            {t.nav.home}
          </NavLink>
          <NavLink
            to="/all-tools"
            onClick={() => setMobileOpen(false)}
            className={mobileNavLinkClass}
          >
            {t.nav.allTools}
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setMobileOpen(false)}
            className={mobileNavLinkClass}
          >
            {t.nav.about}
          </NavLink>
        </nav>
      )}
    </header>
  );
};
