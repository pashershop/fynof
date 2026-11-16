import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Cookie,
  Copy,
  Database,
  FileText,
  Lock,
  Mail,
  Megaphone,
  Scale,
  ShieldCheck,
  Sparkles,
  UserX,
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { useApp } from '../context/AppContext';

const SITE_ORIGIN = 'https://fynof.pages.dev';

interface LegalLayoutProps {
  title: string;
  description: string;
  canonicalPath: string;
  breadcrumbLabel: string;
  children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalLayoutProps> = ({
  title,
  description,
  canonicalPath,
  breadcrumbLabel,
  children,
}) => {
  const { lang } = useApp();

  const legalTabs = [
    { to: '/about', label: lang === 'en' ? 'About Us' : 'আমাদের সম্পর্কে' },
    { to: '/contact', label: lang === 'en' ? 'Contact Us' : 'যোগাযোগ' },
    { to: '/privacy-policy', label: lang === 'en' ? 'Privacy Policy' : 'প্রাইভেসি পলিসি' },
    { to: '/terms', label: lang === 'en' ? 'Terms of Service' : 'শর্তাবলী' },
    { to: '/disclaimer', label: lang === 'en' ? 'Disclaimer' : 'ডিসক্লেইমার' },
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_ORIGIN}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: breadcrumbLabel,
        item: `${SITE_ORIGIN}${canonicalPath}`,
      },
    ],
  };

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        canonicalPath={canonicalPath}
        jsonLd={breadcrumbSchema}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-5">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            {lang === 'en' ? 'Home' : 'হোম'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-800">{breadcrumbLabel}</span>
        </nav>

        {/* Quick Navigation across Legal & Company Pages */}
        <div
          aria-label="Company and Legal Pages"
          className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100 border border-slate-200/80 mb-8"
        >
          {legalTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-blue-700 font-semibold shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        <article className="space-y-6">{children}</article>
      </div>
    </>
  );
};

export const AboutPage: React.FC = () => {
  const { lang } = useApp();

  return (
    <LegalPageLayout
      title="About Us – Privacy-First Free Image Tools | Fynof"
      description="Learn how Fynof delivers 15 free online image editing and PDF processing tools directly inside your browser without server uploads."
      canonicalPath="/about"
      breadcrumbLabel={lang === 'en' ? 'About Us' : 'আমাদের সম্পর্কে'}
    >
      <header className="space-y-3 border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          {lang === 'en' ? 'About Fynof' : 'Fynof সম্পর্কে'}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
          {lang === 'en'
            ? 'Edit Images. Create More. Stay Free. Fynof is a privacy-first online photo editing and document utility platform built to run directly inside your web browser.'
            : 'Edit Images. Create More. Stay Free. Fynof হলো একটি প্রাইভেসি-ফার্স্ট অনলাইন ফটো এডিটিং ও ডকুমেন্ট ইউটিলিটি প্ল্যাটফর্ম, যা সরাসরি আপনার ব্রাউজারে চলে।'}
        </p>
      </header>

      <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
        <p>
          {lang === 'en'
            ? 'Most online image websites upload your personal photos, passport portraits, signatures, and PDF documents to remote cloud servers just to resize or compress a file. Fynof eliminates that risk by performing all pixel processing locally on your own device via HTML5 Canvas, Web Workers, and modern browser APIs.'
            : 'অধিকাংশ অনলাইন ইমেজ ওয়েবসাইট ছবি রিসাইজ বা কম্প্রেস করার জন্য আপনার ব্যক্তিগত ছবি, পাসপোর্ট ফটো, সিগনেচার ও পিডিএফ রিমোট সার্ভারে আপলোড করে। Fynof এই ঝুঁকি সম্পূর্ণ দূর করে—HTML5 Canvas এবং আধুনিক ব্রাউজার প্রযুক্তি ব্যবহার করে সব প্রসেসিং সরাসরি আপনার ডিভাইসেই সম্পন্ন হয়।'}
        </p>
        <p>
          {lang === 'en'
            ? 'From compressing photos to exact KB targets and converting formats (JPG, PNG, WEBP, PDF) to preparing official Passport, NID, and Bangladesh Govt Job portal photos & signatures, all 15 tools work instantly without registration, paywalls, or watermarks.'
            : 'নির্দিষ্ট KB সাইজে ছবি কম্প্রেস করা, ফরম্যাট পরিবর্তন (JPG, PNG, WEBP, PDF) থেকে শুরু করে পাসপোর্ট ফটো, এনআইডি ও সরকারি চাকরির আবেদন ফর্মের ছবি ও সিগনেচার তৈরি—১৫টি টুলই কোনো অ্যাকাউন্ট, পেওয়াল বা ওয়াটারমার্ক ছাড়াই বিনামূল্যে ব্যবহার করা যায়।'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">
            {lang === 'en' ? 'Zero Server Uploads' : 'সার্ভারে আপলোড হয় না'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {lang === 'en'
              ? 'Your files never leave your browser memory. Ideal for sensitive IDs, signatures, and personal photos.'
              : 'আপনার ফাইল কখনো ব্রাউজারের বাইরে যায় না—এনআইডি, সিগনেচার ও ব্যক্তিগত ছবির জন্য সম্পূর্ণ নিরাপদ।'}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">
            {lang === 'en' ? '15 Essential Utilities' : '১৫টি প্রয়োজনীয় টুলস'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {lang === 'en'
              ? 'Compression, resizing, conversion, cropping, passport layouts, PDF tools, watermarks, filters, and Base64.'
              : 'কম্প্রেসর, রিসাইজার, কনভার্টার, ক্রপার, পাসপোর্ট মেকার, পিডিএফ, ওয়াটারমার্ক, ফিল্টার এবং Base64 টুল।'}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <UserX className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">
            {lang === 'en' ? 'Free & No Signup' : 'ফ্রি এবং সাইনআপ-মুক্ত'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {lang === 'en'
              ? 'No login walls, no daily credits, and clean bilingual support in English and Bengali.'
              : 'লগইন বা ক্রেডিটের কোনো ঝামেলা নেই; ইংরেজি ও বাংলা দুই ভাষাতেই সহজে ব্যবহারযোগ্য।'}
          </p>
        </div>
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-3">
        <Link
          to="/all-tools"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <span>{lang === 'en' ? 'Explore All 15 Tools' : 'সব ১৫টি টুলস দেখুন'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/privacy-policy"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          <span>{lang === 'en' ? 'Read Privacy Policy' : 'প্রাইভেসি পলিসি পড়ুন'}</span>
        </Link>
      </div>
    </LegalPageLayout>
  );
};

export const ContactPage: React.FC = () => {
  const { lang } = useApp();
  const [copied, setCopied] = useState(false);
  const supportEmail = 'support@fynof.pages.dev';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <LegalPageLayout
      title="Contact Us – Support & Legal Inquiries | Fynof"
      description="Get in touch with the Fynof team for tool suggestions, preset requests, bug reports, or privacy and legal questions via email."
      canonicalPath="/contact"
      breadcrumbLabel={lang === 'en' ? 'Contact Us' : 'যোগাযোগ'}
    >
      <header className="space-y-3 border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          {lang === 'en' ? 'Contact Fynof' : 'Fynof-এর সাথে যোগাযোগ করুন'}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
          {lang === 'en'
            ? 'Have a feature suggestion, new preset dimension request, bug report, or privacy question? Reach our team directly.'
            : 'নতুন টুল বা সাইজ প্রিসেটের পরামর্শ, কোনো সমস্যা (Bug Report) কিংবা প্রাইভেসি সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের ইমেইল করুন।'}
        </p>
      </header>

      <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
        <div className="flex items-center gap-2.5 text-base font-semibold text-slate-900">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Mail className="w-4 h-4" />
          </div>
          <span>{lang === 'en' ? 'Direct Email Support' : 'সরাসরি ইমেইল সাপোর্ট'}</span>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          {lang === 'en'
            ? 'Because Fynof has zero user accounts or databases, we do not store contact form submissions on servers. Use your email app below to write to us directly:'
            : 'Fynof কোনো ইউজার ডাটাবেস সংরক্ষণ করে না, তাই সরাসরি ইমেইলের মাধ্যমে যোগাযোগ করা সবচেয়ে দ্রুত ও নিরাপদ:'}
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`mailto:${supportEmail}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>{supportEmail}</span>
          </a>

          <button
            type="button"
            onClick={handleCopyEmail}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">{lang === 'en' ? 'Copied' : 'কপি হয়েছে'}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{lang === 'en' ? 'Copy Email' : 'ইমেইল কপি করুন'}</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-500">
          {lang === 'en'
            ? 'Official Website: https://fynof.pages.dev · Typical response window: 1–3 business days.'
            : 'অফিশিয়াল ওয়েবসাইট: https://fynof.pages.dev · সাধারণত ১–৩ কর্মদিবসের মধ্যে উত্তর দেওয়া হয়।'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">
            {lang === 'en' ? 'Reporting a Tool Issue' : 'কোনো টুলের সমস্যা জানাতে'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {lang === 'en'
              ? 'Please mention the tool name (e.g., Image Compressor), image format (JPG/PNG/WEBP), and your browser/device so we can reproduce it quickly. Please do not attach sensitive ID photos.'
              : 'সমস্যার দ্রুত সমাধানের জন্য টুলের নাম, ছবির ফরম্যাট (JPG/PNG/WEBP) এবং আপনার ব্রাউজার/ডিভাইসের নাম উল্লেখ করুন। অনুগ্রহ করে সংবেদনশীল আইডি বা পাসপোর্ট ছবি পাঠাবেন না।'}
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">
            {lang === 'en' ? 'Privacy, Legal & Ad Inquiries' : 'প্রাইভেসি, আইনি ও বিজ্ঞাপন সংক্রান্ত'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {lang === 'en'
              ? 'For questions about our Privacy Policy, cookies, Terms of Service, Disclaimer, or advertising partnerships, include "Legal / Privacy" in your email subject.'
              : 'প্রাইভেসি পলিসি, কুকিজ, শর্তাবলী, ডিসক্লেইমার বা বিজ্ঞাপন সংক্রান্ত বিষয়ের জন্য ইমেইলের Subject-এ "Legal / Privacy" লিখুন।'}
          </p>
        </div>
      </div>
    </LegalPageLayout>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  const { lang } = useApp();

  return (
    <LegalPageLayout
      title="Privacy Policy – Client-Side Image & Ad Rules | Fynof"
      description="Read Fynof's Privacy Policy detailing local browser image processing, localStorage preferences, cookie rules, and advertising partners."
      canonicalPath="/privacy-policy"
      breadcrumbLabel={lang === 'en' ? 'Privacy Policy' : 'প্রাইভেসি পলিসি'}
    >
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          {lang === 'en' ? 'Privacy Policy' : 'প্রাইভেসি পলিসি (গোপনীয়তা নীতিমালা)'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {lang === 'en'
            ? 'Effective & Last Updated: November 16, 2026 · Website: https://fynof.pages.dev'
            : 'কার্যকর ও সর্বশেষ হালনাগাদ: ১৬ নভেম্বর ২০২৬ · ওয়েবসাইট: https://fynof.pages.dev'}
        </p>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-1">
          {lang === 'en'
            ? 'At Fynof, protecting your privacy is built directly into our architecture. This Privacy Policy clearly explains how image processing, browser Local Storage, cookies, and third-party advertising work when you use Fynof.'
            : 'Fynof-এ আপনার তথ্যের গোপনীয়তা আমাদের মূল ভিত্তি। আপনি যখন Fynof ব্যবহার করেন তখন ইমেজ প্রসেসিং, ব্রাউজার Local Storage, কুকিজ এবং বিজ্ঞাপন কীভাবে কাজ করে তা এখানে স্পষ্টভাবে ব্যাখ্যা করা হয়েছে।'}
        </p>
      </header>

      {/* Privacy Highlights Summary */}
      <div className="p-4 sm:p-5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          <strong className="text-slate-900">
            {lang === 'en' ? 'Key Privacy Guarantee: ' : 'মূল গোপনীয়তা নিশ্চয়তা: '}
          </strong>
          {lang === 'en'
            ? 'Fynof does not upload, collect, inspect, or store any images, signatures, passport photos, or PDFs you edit. All 15 tools run 100% locally inside your web browser.'
            : 'Fynof আপনার কোনো ছবি, সিগনেচার, পাসপোর্ট ফটো বা পিডিএফ ফাইল সার্ভারে আপলোড, সংগ্রহ বা সংরক্ষণ করে না। ১৫টি টুলই সম্পূর্ণ আপনার ব্রাউজারে কাজ করে।'}
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Image & PDF Processing */}
        <section className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-blue-600 shrink-0" />
            <h2 className="text-lg font-semibold text-slate-950">
              {lang === 'en'
                ? '1. Image & PDF Processing (Zero Server Uploads)'
                : '১. ইমেজ ও পিডিএফ প্রসেসিং (সার্ভারে আপলোড হয় না)'}
            </h2>
          </div>
          <div className="space-y-2.5 text-sm sm:text-base text-slate-700 leading-relaxed">
            <p>
              {lang === 'en'
                ? 'Every editing operation on Fynof—including compression, resizing, format conversion, cropping, passport sheet generation, NID/signature resizing, watermarking, blurring, filters, PDF conversion, and Base64 encoding—executes entirely on your own device using HTML5 Canvas, JavaScript, and browser Web Workers.'
                : 'Fynof-এর প্রতিটি কাজ—যেমন ইমেজ কম্প্রেশন, রিসাইজ, ফরম্যাট কনভার্সন, ক্রপিং, পাসপোর্ট ফটো শিট, এনআইডি/সিগনেচার রিসাইজ, ওয়াটারমার্ক, ব্লার, ফিল্টার, পিডিএফ কনভার্সন ও Base64 এনকোডিং—HTML5 Canvas, JavaScript ও Web Worker ব্যবহার করে সরাসরি আপনার ডিভাইসে সম্পন্ন হয়।'}
            </p>
            <p>
              {lang === 'en'
                ? 'Selected files stay strictly in temporary browser memory (Blob / Object URLs) only while you actively edit them. They are never transmitted over the network to Fynof servers, and they are automatically cleared from memory when you click Clear, reload, or close the browser tab.'
                : 'আপলোড করা ফাইলগুলো শুধুমাত্র আপনি এডিট করার সময় ব্রাউজারের অস্থায়ী মেমোরিতে (Blob / Object URL) থাকে। এগুলো কখনোই Fynof বা কোনো বাইরের সার্ভারে পাঠানো হয় না এবং ট্যাব বন্ধ করলে বা Clear করলে তাৎক্ষণিক মুছে যায়।'}
            </p>
          </div>
        </section>

        {/* 2. Local Storage */}
        <section className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-blue-600 shrink-0" />
            <h2 className="text-lg font-semibold text-slate-950">
              {lang === 'en'
                ? '2. Browser Local Storage Usage'
                : '২. ব্রাউজার Local Storage-এর ব্যবহার'}
            </h2>
          </div>
          <div className="space-y-2.5 text-sm sm:text-base text-slate-700 leading-relaxed">
            <p>
              {lang === 'en'
                ? 'Fynof does not use user accounts or server databases. Instead, it uses your browser’s built-in localStorage solely for non-personal UI preferences stored exclusively on your device:'
                : 'Fynof কোনো অ্যাকাউন্ট বা সার্ভার ডাটাবেস ব্যবহার করে না। শুধুমাত্র ব্যবহারের সুবিধার্থে আপনার ডিভাইসের ব্রাউজার localStorage-এ নিচের সাধারণ সেটিংসগুলো সংরক্ষণ করা হয়:'}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
              <li>
                <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 font-mono text-xs">
                  fynof_lang
                </code>{' '}
                —{' '}
                {lang === 'en'
                  ? 'Remembers your preferred display language (English or Bengali).'
                  : 'আপনার নির্বাচিত ভাষা (English বা বাংলা) মনে রাখে।'}
              </li>
              <li>
                <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 font-mono text-xs">
                  fynof_recent_tools
                </code>{' '}
                —{' '}
                {lang === 'en'
                  ? 'Stores up to 4 recently opened tool IDs locally so you can return to them quickly from the Homepage.'
                  : 'হোমপেজ থেকে দ্রুত খুঁজে পাওয়ার জন্য সর্বশেষ ব্যবহৃত সর্বোচ্চ ৪টি টুলের আইডি সংরক্ষণ করে।'}
              </li>
            </ul>
            <p>
              {lang === 'en'
                ? 'No images, filenames, personal details, or IP addresses are ever saved in localStorage. You may clear this data at any time through your browser’s Clear Site Data settings.'
                : 'localStorage-এ কখনোই কোনো ছবি, ফাইলের নাম, ব্যক্তিগত তথ্য বা IP ঠিকানা সংরক্ষণ করা হয় না। আপনি যেকোনো সময় ব্রাউজারের Site Data ক্লিয়ার করে এগুলো মুছে ফেলতে পারবেন।'}
            </p>
          </div>
        </section>

        {/* 3. Cookies */}
        <section className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center gap-2.5">
            <Cookie className="w-5 h-5 text-blue-600 shrink-0" />
            <h2 className="text-lg font-semibold text-slate-950">
              {lang === 'en' ? '3. Cookies & Similar Technologies' : '৩. কুকিজ (Cookies) সংক্রান্ত তথ্য'}
            </h2>
          </div>
          <div className="space-y-2.5 text-sm sm:text-base text-slate-700 leading-relaxed">
            <p>
              {lang === 'en'
                ? 'Fynof itself does not set any first-party tracking, advertising, login, or profiling cookies.'
                : 'Fynof নিজস্বভাবে কোনো ফার্স্ট-পার্টি ট্র্যাকিং, লগইন বা প্রোফাইলিং কুকি সেট করে না।'}
            </p>
            <p>
              {lang === 'en'
                ? 'However, third-party services integrated into the site—such as advertising partners (for example Monetag or similar ad networks when active) or standard infrastructure/font providers (Cloudflare Pages, Google Fonts)—may place or read cookies or standard HTTP headers (such as IP address and browser user-agent) in accordance with their own privacy policies to deliver assets, prevent fraud, or measure ad impressions.'
                : 'তবে সাইটে সক্রিয় থার্ড-পার্টি সেবা—যেমন বিজ্ঞাপন নেটওয়ার্ক (যেমন Monetag বা সমজাতীয় অ্যাড পার্টনার) কিংবা ফন্ট ও হোস্টিং সেবা (Cloudflare Pages, Google Fonts)—তাদের নিজস্ব প্রাইভেসি পলিসি অনুযায়ী কুকি বা সাধারণ ব্রাউজার হেডার ব্যবহার করতে পারে, যা মূলত বিজ্ঞাপন প্রদর্শন, নিরাপত্তা ও পারফরম্যান্সের জন্য ব্যবহৃত হয়।'}
            </p>
            <p>
              {lang === 'en'
                ? 'You can disable or delete third-party cookies anytime via your browser settings. Core Fynof image tools will continue working normally even with cookies disabled.'
                : 'আপনি চাইলে ব্রাউজার সেটিংস থেকে যেকোনো সময় কুকিজ বন্ধ বা মুছে ফেলতে পারেন। কুকি বন্ধ থাকলেও Fynof-এর সব ইমেজ এডিটিং টুল স্বাভাবিকভাবেই কাজ করবে।'}
            </p>
          </div>
        </section>

        {/* 4. Advertising */}
        <section className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center gap-2.5">
            <Megaphone className="w-5 h-5 text-blue-600 shrink-0" />
            <h2 className="text-lg font-semibold text-slate-950">
              {lang === 'en'
                ? '4. Advertising & Monetization'
                : '৪. বিজ্ঞাপন (Advertising) নীতিমালা'}
            </h2>
          </div>
          <div className="space-y-2.5 text-sm sm:text-base text-slate-700 leading-relaxed">
            <p>
              {lang === 'en'
                ? 'To keep all 15 tools 100% free with no paywalls or subscriptions, Fynof reserves clearly labeled advertising slots on pages (compatible with third-party ad networks such as Monetag or Google AdSense).'
                : '১৫টি টুল সম্পূর্ণ বিনামূল্যে এবং কোনো সাবস্ক্রিপশন ছাড়াই চালু রাখার জন্য Fynof ওয়েবসাইটের নির্দিষ্ট স্থানে স্পষ্টভাবে চিহ্নিত বিজ্ঞাপন স্লট ব্যবহার করে (যা Monetag বা সমজাতীয় থার্ড-পার্টি অ্যাড নেটওয়ার্কের সাথে সামঞ্জস্যপূর্ণ)।'}
            </p>
            <p>
              {lang === 'en'
                ? 'Advertising scripts are strictly isolated from our image processing workspace. Third-party advertisers never gain access to the photos, documents, canvas pixels, or Base64 strings you process on Fynof.'
                : 'বিজ্ঞাপন স্লটগুলো ইমেজ এডিটিং ওয়ার্কস্পেস থেকে সম্পূর্ণ আলাদা। কোনো বিজ্ঞাপন নেটওয়ার্ক বা থার্ড পার্টি কখনোই আপনার আপলোড করা ছবি, ডকুমেন্ট বা এডিট করা ফাইল দেখতে বা অ্যাক্সেস করতে পারে না।'}
            </p>
          </div>
        </section>

        {/* 5. Children's Privacy & Updates */}
        <section className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
            <h2 className="text-lg font-semibold text-slate-950">
              {lang === 'en'
                ? '5. External Links, Updates & Contact'
                : '৫. বাহ্যিক লিঙ্ক, পরিবর্তন ও যোগাযোগ'}
            </h2>
          </div>
          <div className="space-y-2.5 text-sm sm:text-base text-slate-700 leading-relaxed">
            <p>
              {lang === 'en'
                ? 'Fynof does not knowingly collect personal information from anyone, including children under 13. Pages or advertisements may link to external websites whose privacy practices are governed by their own policies.'
                : 'Fynof জেনেশুনে ১৩ বছরের কম বয়সী শিশু বা কোনো ব্যবহারকারীর ব্যক্তিগত তথ্য সংগ্রহ করে না। ওয়েবসাইট বা বিজ্ঞাপনের বাহ্যিক লিঙ্কে প্রবেশ করলে সেই সাইটের নিজস্ব প্রাইভেসি পলিসি প্রযোজ্য হবে।'}
            </p>
            <p>
              {lang === 'en'
                ? 'We may update this Privacy Policy whenever new features or ad partners are introduced. Questions can be sent anytime to '
                : 'নতুন ফিচার বা নীতিমালা পরিবর্তনের সাথে সাথে এই প্রাইভেসি পলিসি হালনাগাদ করা হতে পারে। যেকোনো প্রশ্নে যোগাযোগ করুন: '}
              <a
                href="mailto:support@fynof.pages.dev"
                className="text-blue-600 font-medium hover:underline"
              >
                support@fynof.pages.dev
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
};

export const TermsPage: React.FC = () => {
  const { lang } = useApp();

  const sections =
    lang === 'en'
      ? [
          {
            heading: '1. Acceptance of Terms',
            body: 'By accessing or using Fynof (https://fynof.pages.dev), you agree to comply with these Terms of Service and our Privacy Policy and Disclaimer. If you do not agree with any part of these terms, please discontinue using the website.',
          },
          {
            heading: '2. Free License & Permitted Usage',
            body: 'Fynof provides online image editing and PDF utilities free of charge for personal, academic, creative, and commercial workflows without signup or usage caps. You may process and export files freely, provided you do not attempt to scrape, disrupt, mirror, or abuse our web infrastructure.',
          },
          {
            heading: '3. User Content Ownership & Responsibility',
            body: 'Because all image and PDF processing runs strictly inside your browser, you retain 100% ownership and copyright of every file you load and download. You confirm that you hold the necessary rights or permissions to edit the images or documents you process using Fynof.',
          },
          {
            heading: '4. Prohibited Uses',
            body: 'You agree not to use Fynof to generate fraudulent official documents, counterfeit identity records, unlawful content, or to inject malicious scripts into the site or interfere with advertising and hosting infrastructure.',
          },
          {
            heading: '5. "As-Is" Service & Limitation of Liability',
            body: 'All tools are provided on an "as is" and "as available" basis without express or implied warranties. Fynof is not liable for data loss, rejected portal applications, browser memory crashes on very large files, or any indirect damages arising from tool usage.',
          },
          {
            heading: '6. Advertising & Third-Party Links',
            body: 'Fynof may display advertisements and third-party links to keep all utilities free. Interactions with external websites or advertisers are solely between you and the respective third party.',
          },
          {
            heading: '7. Updates to These Terms',
            body: 'We reserve the right to update or modify these Terms of Service at any time without prior notice. Continued use of Fynof after updates are published constitutes acceptance of the revised terms.',
          },
        ]
      : [
          {
            heading: '১. শর্তাবলীর স্বীকৃতি',
            body: 'Fynof (https://fynof.pages.dev) ব্যবহার করার মাধ্যমে আপনি এই ব্যবহারের শর্তাবলী, প্রাইভেসি পলিসি এবং ডিসক্লেইমার মেনে নিচ্ছেন। কোনো শর্তের সাথে একমত না হলে অনুগ্রহ করে ওয়েবসাইটটি ব্যবহার থেকে বিরত থাকুন।',
          },
          {
            heading: '২. ফ্রি ব্যবহার ও অনুমোদিত ক্ষেত্র',
            body: 'Fynof ব্যক্তিগত, শিক্ষামূলক এবং বাণিজ্যিক কাজের জন্য সম্পূর্ণ বিনামূল্যে ইমেজ ও পিডিএফ টুলস প্রদান করে। তবে সাইটের কোড স্ক্র্যাপিং, সার্ভার বা হোস্টিং অবকাঠামোর ক্ষতি বা অপব্যবহার সম্পূর্ণ নিষিদ্ধ।',
          },
          {
            heading: '৩. কনটেন্টের মালিকানা ও দায়িত্ব',
            body: 'সব প্রসেসিং আপনার ব্রাউজারে সম্পন্ন হওয়ায় এডিট ও ডাউনলোড করা প্রতিটি ছবির সম্পূর্ণ মালিকানা আপনারই থাকে। আপনি যে ফাইল এডিট করছেন তা ব্যবহারের বৈধ অধিকার আপনার রয়েছে তা নিশ্চিত করা আপনার দায়িত্ব।',
          },
          {
            heading: '৪. নিষিদ্ধ ব্যবহার',
            body: 'ভুয়া সরকারি ডকুমেন্ট, জাল পরিচয়পত্র বা বেআইনি কনটেন্ট তৈরি এবং সাইট বা বিজ্ঞাপন ব্যবস্থায় কোনো ক্ষতিকর স্ক্রিপ্ট প্রয়োগের জন্য Fynof ব্যবহার করা যাবে না।',
          },
          {
            heading: '৫. সেবার সীমাবদ্ধতা ও দায়মুক্তি',
            body: 'সকল টুল "যেমন আছে" (As-Is) ভিত্তিতে প্রদান করা হয়। বড় ফাইলের কারণে ব্রাউজার ক্র্যাশ, ডাটা হারানো কিংবা কোনো আবেদন বাতিল হওয়ার জন্য Fynof দায়ী থাকবে না।',
          },
          {
            heading: '৬. বিজ্ঞাপন ও থার্ড-পার্টি লিঙ্ক',
            body: 'বিনামূল্যে সেবা চালু রাখতে ওয়েবসাইটে বিজ্ঞাপন ও বাহ্যিক লিঙ্ক প্রদর্শিত হতে পারে। বাহ্যিক ওয়েবসাইটের যেকোনো লেনদেন বা সেবার দায়ভার সংশ্লিষ্ট তৃতীয় পক্ষের।',
          },
          {
            heading: '৭. শর্তাবলী পরিবর্তন',
            body: 'Fynof যেকোনো সময় এই শর্তাবলী হালনাগাদ করার অধিকার সংরক্ষণ করে। পরিবর্তনের পর ওয়েবসাইট ব্যবহার অব্যাহত রাখলে তা নতুন শর্তাবলীর সম্মতি হিসেবে গণ্য হবে।',
          },
        ];

  return (
    <LegalPageLayout
      title="Terms of Service – Free Online Image Tools | Fynof"
      description="Review the Fynof Terms of Service covering free personal and commercial usage, content ownership, and browser-based tool policies."
      canonicalPath="/terms"
      breadcrumbLabel={lang === 'en' ? 'Terms of Service' : 'ব্যবহারের শর্তাবলী'}
    >
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2.5">
          <Scale className="w-6 h-6 text-blue-600 shrink-0" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            {lang === 'en' ? 'Terms of Service' : 'ব্যবহারের শর্তাবলী (Terms of Service)'}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          {lang === 'en'
            ? 'Effective & Last Updated: November 16, 2026'
            : 'কার্যকর ও সর্বশেষ হালনাগাদ: ১৬ নভেম্বর ২০২৬'}
        </p>
      </header>

      <div className="space-y-4">
        {sections.map((section) => (
          <section
            key={section.heading}
            className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white space-y-2"
          >
            <h2 className="text-base sm:text-lg font-semibold text-slate-950">
              {section.heading}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>
    </LegalPageLayout>
  );
};

export const DisclaimerPage: React.FC = () => {
  const { lang } = useApp();

  const sections =
    lang === 'en'
      ? [
          {
            heading: '1. General Utility Disclaimer',
            body: 'All image editing, compression, conversion, and PDF tools on Fynof (https://fynof.pages.dev) are provided strictly for general convenience and informational productivity. While we strive for accurate pixel dimensions, DPI layouts, and file-size targets, exact output behavior can vary slightly depending on your device, browser engine, and source image encoding.',
          },
          {
            heading: '2. Official Document, Passport & Job Portal Presets',
            body: 'Presets included in tools such as Passport Photo Maker, NID & Job Portal Photo Resizer, and Signature Resizer (including 300×300 px, 300×80 px, and KB size guides) are built around commonly published standards. Official specifications set by government agencies, Bangladesh Public Service Commission (BPSC), Teletalk, embassies, or examination boards may change at any time. Always verify final dimensions, file size, background color, and clarity against the receiving authority’s official instructions before submitting.',
          },
          {
            heading: '3. Keep Original Backups',
            body: 'Lossy compression, cropping, blurring, watermarking, and format conversions alter image data. Because processing happens directly inside your browser without cloud copies, always keep an unaltered backup of your original image or PDF before saving or replacing files.',
          },
          {
            heading: '4. No Professional or Legal Advice',
            body: 'Nothing on Fynof—including tool guides, FAQ answers, or preset labels—constitutes official legal, immigration, government application, or cybersecurity advice.',
          },
          {
            heading: '5. Advertising & External Links Disclaimer',
            body: 'Designated advertising slots on Fynof may display third-party ads or links to external websites. Fynof does not control, endorse, or guarantee the accuracy, safety, or claims of any third-party advertiser, product, or external site.',
          },
        ]
      : [
          {
            heading: '১. সাধারণ ব্যবহারিক ডিসক্লেইমার',
            body: 'Fynof (https://fynof.pages.dev)-এর সকল ইমেজ এডিটিং, কম্প্রেশন, কনভার্সন ও পিডিএফ টুল কেবল দৈনন্দিন কাজের সুবিধার জন্য প্রদান করা হয়েছে। আমরা সর্বোচ্চ নির্ভুলতা বজায় রাখার চেষ্টা করলেও ডিভাইস, ব্রাউজার ও ছবির মূল এনকোডিং ভেদে আউটপুটে সামান্য পার্থক্য হতে পারে।',
          },
          {
            heading: '২. পাসপোর্ট, এনআইডি ও সরকারি চাকরির ফরম্যাট প্রিসেট',
            body: 'Passport Photo Maker, NID & Job Portal Photo Resizer এবং Signature Resizer-এ থাকা প্রিসেটগুলো (যেমন 300×300 px, 300×80 px এবং KB সীমা) প্রচলিত সাধারণ নির্দেশিকা অনুযায়ী তৈরি। সরকারি দপ্তর, BPSC, টেলিটক, দূতাবাস বা পরীক্ষার কর্তৃপক্ষের নিয়ম যেকোনো সময় পরিবর্তিত হতে পারে—তাই চূড়ান্ত আবেদন জমা দেওয়ার আগে অবশ্যই সংশ্লিষ্ট কর্তৃপক্ষের অফিশিয়াল নির্দেশনার সাথে ছবির মাপ, সাইজ ও ব্যাকগ্রাউন্ড মিলিয়ে দেখুন।',
          },
          {
            heading: '৩. মূল ফাইলের ব্যাকআপ রাখুন',
            body: 'কম্প্রেশন, ক্রপ, ব্লার বা ফরম্যাট পরিবর্তনের ফলে ছবির তথ্য পরিবর্তিত হয়। যেহেতু Fynof কোনো ফাইল সার্ভারে সংরক্ষণ করে না, তাই এডিট করার আগে আপনার মূল ছবি বা পিডিএফ ফাইলের একটি কপি নিরাপদ স্থানে রাখুন।',
          },
          {
            heading: '৪. পেশাদার বা আইনি পরামর্শ নয়',
            body: 'Fynof-এ প্রদত্ত কোনো গাইড, প্রিসেট বা FAQ উত্তর আইনি, অভিবাসন বা সরকারি আবেদনের আনুষ্ঠানিক পরামর্শ হিসেবে গণ্য হবে না।',
          },
          {
            heading: '৫. বিজ্ঞাপন ও বাহ্যিক লিঙ্ক ডিসক্লেইমার',
            body: 'ওয়েবসাইটের বিজ্ঞাপন স্লটে তৃতীয় পক্ষের বিজ্ঞাপন বা বাহ্যিক লিঙ্ক প্রদর্শিত হতে পারে। বিজ্ঞাপনদাতা বা বাইরের কোনো ওয়েবসাইটের পণ্য, সেবা বা তথ্যের সত্যতার দায় Fynof বহন করে না।',
          },
        ];

  return (
    <LegalPageLayout
      title="Disclaimer – Document Presets & General Info | Fynof"
      description="Read the Fynof Disclaimer regarding general tool accuracy, official passport, NID, and job portal photo rules, and third-party ads."
      canonicalPath="/disclaimer"
      breadcrumbLabel={lang === 'en' ? 'Disclaimer' : 'ডিসক্লেইমার'}
    >
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            {lang === 'en' ? 'Disclaimer' : 'ডিসক্লেইমার (দায়মুক্তি ঘোষণা)'}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          {lang === 'en'
            ? 'Effective & Last Updated: November 16, 2026 · Website: https://fynof.pages.dev'
            : 'কার্যকর ও সর্বশেষ হালনাগাদ: ১৬ নভেম্বর ২০২৬ · ওয়েবসাইট: https://fynof.pages.dev'}
        </p>
      </header>

      <div className="space-y-4">
        {sections.map((section) => (
          <section
            key={section.heading}
            className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white space-y-2"
          >
            <h2 className="text-base sm:text-lg font-semibold text-slate-950">
              {section.heading}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>
    </LegalPageLayout>
  );
};
