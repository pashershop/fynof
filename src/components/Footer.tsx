import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TOOLS } from '../data/tools';

export const Footer: React.FC = () => {
  const { lang, t } = useApp();
  const popularTools = TOOLS.filter((tool) => tool.popular);

  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-200">
          <div className="md:col-span-5 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <svg
                width="26"
                height="26"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect width="28" height="28" rx="7" fill="#2563EB" />
                <path
                  d="M8.5 8.5H19.5V11.5H11.8V13.6H18V16.5H11.8V20.5H8.5V8.5Z"
                  fill="#FFFFFF"
                />
                <rect x="16.5" y="17.5" width="3.5" height="3.5" rx="0.75" fill="#93C5FD" />
              </svg>
              <span className="text-lg font-bold tracking-tight text-slate-900">Fynof</span>
            </Link>
            <p className="text-sm font-medium text-slate-700">{t.footer.tagline}</p>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              {t.footer.privacyNotice}
            </p>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">{t.footer.navigation}</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link to="/all-tools" className="hover:text-blue-600 transition-colors">
                  {t.footer.allTools}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-600 transition-colors">
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-600 transition-colors">
                  {t.footer.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">{t.footer.popular}</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {popularTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    to={`/${tool.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {tool.name[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">{t.footer.legal}</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/privacy-policy" className="hover:text-blue-600 transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-600 transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {t.footer.copyright}
          </p>
          <p>fynof.pages.dev</p>
        </div>
      </div>
    </footer>
  );
};
