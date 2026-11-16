import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { SearchModal } from './components/SearchModal';
import { AppProvider } from './context/AppContext';
import { AllToolsPage } from './pages/AllToolsPage';
import { HomePage } from './pages/HomePage';
import {
  AboutPage,
  ContactPage,
  DisclaimerPage,
  PrivacyPolicyPage,
  TermsPage,
} from './pages/StaticPages';
import { ToolRoutePage } from './pages/ToolRoutePage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-white text-slate-900">
          <Header />
          <SearchModal />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/all-tools" element={<AllToolsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/disclaimer" element={<DisclaimerPage />} />
              <Route path="/:slug" element={<ToolRoutePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
