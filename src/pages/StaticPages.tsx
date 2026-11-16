import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const { lang } = useApp();
  return (
    <>
      <SEOHead
        title="About Fynof – Privacy-First Free Image Tools"
        description="Learn how Fynof delivers 15 free online image editing and PDF processing tools directly inside your browser without server uploads."
        canonicalPath="/about"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {lang === 'en' ? 'About Fynof' : 'Fynof সম্পর্কে'}
        </h1>
        <p className="text-base text-slate-700 leading-relaxed">
          {lang === 'en'
            ? 'Fynof (https://fynof.pages.dev) is a free online image editing and PDF utility platform built around a simple rule: your photos belong to you. Every single tool—from compression and passport photo sheets to PDF conversion and blur protection—runs strictly inside your web browser.'
            : 'Fynof (https://fynof.pages.dev) একটি সম্পূর্ণ ফ্রি অনলাইন ইমেজ এডিটিং ও পিডিএফ প্ল্যাটফর্ম। আমাদের মূল নীতি হলো আপনার ছবির সম্পূর্ণ গোপনীয়তা—সকল প্রসেসিং সরাসরি আপনার ব্রাউজারেই সম্পন্ন হয়।'}
        </p>
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Zero Server Storage</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            No accounts, no databases, no upload queues. Powered by HTML Canvas and modern Web APIs so you can process sensitive documents like NID photos, signatures, and passport portraits with complete confidence.
          </p>
        </div>
        <Link
          to="/all-tools"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
        >
          Explore All 15 Tools
        </Link>
      </div>
    </>
  );
};

export const ContactPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Contact Us | Fynof"
        description="Get in touch with the Fynof team for tool suggestions, bug reports, or general inquiries."
        canonicalPath="/contact"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contact Fynof</h1>
        <p className="text-base text-slate-700 leading-relaxed">
          Have a feature request, preset suggestion (for example new photo dimensions), or found an issue on your browser? Reach out directly via email.
        </p>
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>Support & Feedback</span>
          </div>
          <p className="text-sm text-slate-600">
            Email:{' '}
            <a
              href="mailto:support@fynof.pages.dev"
              className="text-blue-600 font-medium hover:underline"
            >
              support@fynof.pages.dev
            </a>
          </p>
          <p className="text-xs text-slate-500">
            Website: https://fynof.pages.dev
          </p>
        </div>
      </div>
    </>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Privacy Policy | Fynof"
        description="Fynof processes all images and PDFs locally in your browser. Zero image uploads, zero tracking of file contents."
        canonicalPath="/privacy-policy"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: 2026</p>
        <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
          <p>
            <strong>1. Local Client-Side Processing:</strong> All 15 image and PDF tools on Fynof execute locally inside your web browser using HTML5 Canvas and JavaScript. Your uploaded images, signatures, passport photos, and PDFs are never transmitted to or stored on any external server.
          </p>
          <p>
            <strong>2. Local Preferences:</strong> Fynof uses your browser&apos;s localStorage strictly to remember your selected display language (English or Bengali). No personal data or account credentials are collected.
          </p>
          <p>
            <strong>3. Advertising Partners:</strong> Future third-party ad networks (such as Monetag) integrated into designated ad slots may use standard cookies in accordance with their own privacy policies, completely separate from your image processing workspace.
          </p>
        </div>
      </div>
    </>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Terms of Service | Fynof"
        description="Terms of service for using Fynof free online client-side image and PDF tools."
        canonicalPath="/terms"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
        <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
          <p>
            <strong>1. Free Usage:</strong> Fynof provides online image editing and PDF conversion tools free of charge for personal, educational, and commercial workflows.
          </p>
          <p>
            <strong>2. User Responsibility:</strong> Because all processing happens directly on your device, you retain full ownership and responsibility for the files you edit and export.
          </p>
          <p>
            <strong>3. Service Availability:</strong> Tools are provided &ldquo;as is&rdquo; without warranty. Always verify critical document specifications (such as passport or government job portal file rules) before final submission.
          </p>
        </div>
      </div>
    </>
  );
};
