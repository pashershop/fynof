import { Language } from '../types/tool';

export const TRANSLATIONS: Record<
  Language,
  {
    nav: {
      home: string;
      allTools: string;
      about: string;
      searchPlaceholder: string;
      searchTitle: string;
      noResults: string;
    };
    hero: {
      heading: string;
      description: string;
      uploadBtn: string;
      exploreBtn: string;
      privacyLine: string;
      chooseToolTitle: string;
      chooseToolSubtitle: string;
    };
    sections: {
      popularTools: string;
      popularSubtitle: string;
      viewAllTools: string;
      browseCategories: string;
      categoriesSubtitle: string;
      whyChooseTitle: string;
      whyChooseSubtitle: string;
      howItWorksTitle: string;
      howItWorksSubtitle: string;
      faqTitle: string;
      faqSubtitle: string;
      relatedTools: string;
      howToUse: string;
      advertisement: string;
    };
    whyChoose: {
      title: string;
      desc: string;
    }[];
    howItWorks: {
      step: string;
      title: string;
      desc: string;
    }[];
    editor: {
      dropTitle: string;
      dropSubtitle: string;
      browseFiles: string;
      supportedFormats: string;
      privacyNote: string;
      usePreviousImage: string;
      clearImage: string;
      changeImage: string;
      undo: string;
      redo: string;
      reset: string;
      original: string;
      edited: string;
      compare: string;
      zoomIn: string;
      zoomOut: string;
      fit: string;
      download: string;
      processing: string;
      before: string;
      after: string;
      originalSize: string;
      outputSize: string;
      saved: string;
      dimensions: string;
      openInAnotherTool: string;
      errorInvalidFile: string;
    };
    footer: {
      tagline: string;
      privacyNotice: string;
      navigation: string;
      popular: string;
      legal: string;
      about: string;
      contact: string;
      privacy: string;
      terms: string;
      allTools: string;
      copyright: string;
    };
  }
> = {
  en: {
    nav: {
      home: 'Home',
      allTools: 'All Tools',
      about: 'About',
      searchPlaceholder: 'Search 15 image & PDF tools...',
      searchTitle: 'Find a Tool',
      noResults: 'No matching tools found.',
    },
    hero: {
      heading: 'Everything You Need to Edit Images.',
      description:
        'Free online image tools to resize, compress, convert, crop and edit your photos. No signup, no limits.',
      uploadBtn: 'Upload Image',
      exploreBtn: 'Explore All Tools',
      privacyLine: '100% browser-based processing · Your files never leave your device',
      chooseToolTitle: 'Image Loaded — Choose a Tool',
      chooseToolSubtitle: 'Select any tool below to start editing immediately.',
    },
    sections: {
      popularTools: 'Popular Tools',
      popularSubtitle: 'Fast, browser-native utilities ready in one click.',
      viewAllTools: 'View all 15 tools',
      browseCategories: 'Browse Categories',
      categoriesSubtitle: 'Organized by workflow for everyday editing, documents, and web publishing.',
      whyChooseTitle: 'Why Choose Fynof',
      whyChooseSubtitle: 'Built for speed, clarity, and complete ownership over your files.',
      howItWorksTitle: 'How It Works',
      howItWorksSubtitle: 'Three steps from raw photo to final download.',
      faqTitle: 'Frequently Asked Questions',
      faqSubtitle: 'Common questions about privacy, file formats, and offline-safe processing.',
      relatedTools: 'Related Tools',
      howToUse: 'How to Use',
      advertisement: 'Advertisement',
    },
    whyChoose: [
      {
        title: '100% Free',
        desc: 'Every tool, preset, and high-resolution export is completely free without hidden paywalls.',
      },
      {
        title: 'No Signup Required',
        desc: 'Start editing immediately without creating an account, verifying email, or logging in.',
      },
      {
        title: 'Privacy First',
        desc: 'All image and PDF processing runs strictly inside your browser with zero server uploads.',
      },
      {
        title: 'Unlimited Usage',
        desc: 'Process as many images, signatures, passport sheets, and PDFs as you need every day.',
      },
    ],
    howItWorks: [
      {
        step: '01',
        title: 'Upload',
        desc: 'Drag and drop or browse JPG, PNG, WEBP, or PDF files directly from your phone or desktop.',
      },
      {
        step: '02',
        title: 'Edit',
        desc: 'Adjust compression targets, dimensions, crops, filters, or layouts with live preview.',
      },
      {
        step: '03',
        title: 'Download',
        desc: 'Save your processed file instantly in full quality with zero watermarks added.',
      },
    ],
    editor: {
      dropTitle: 'Drop your file here',
      dropSubtitle: 'or click to browse from your device',
      browseFiles: 'Browse Files',
      supportedFormats: 'Supports JPG, JPEG, PNG, WEBP',
      privacyNote: '100% private · Processed locally in your browser',
      usePreviousImage: 'Use previously loaded image',
      clearImage: 'Clear',
      changeImage: 'Upload New',
      undo: 'Undo',
      redo: 'Redo',
      reset: 'Reset',
      original: 'Original',
      edited: 'Edited',
      compare: 'Compare',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      fit: 'Fit',
      download: 'Download',
      processing: 'Processing...',
      before: 'Before',
      after: 'After',
      originalSize: 'Original Size',
      outputSize: 'Output Size',
      saved: 'Saved',
      dimensions: 'Dimensions',
      openInAnotherTool: 'Continue in another tool',
      errorInvalidFile: 'Unsupported file format. Please upload a valid image file.',
    },
    footer: {
      tagline: 'Edit Images. Create More. Stay Free.',
      privacyNotice: 'All image processing happens locally in your browser. Zero files are sent to external servers.',
      navigation: 'Navigation',
      popular: 'Popular Tools',
      legal: 'Company & Legal',
      about: 'About',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms',
      allTools: 'All Tools',
      copyright: 'Fynof. Free client-side image tools.',
    },
  },
  bn: {
    nav: {
      home: 'হোম',
      allTools: 'সব টুলস',
      about: 'সম্পর্কে',
      searchPlaceholder: '১৫টি ইমেজ ও পিডিএফ টুল খুঁজুন...',
      searchTitle: 'টুল খুঁজুন',
      noResults: 'কোনো টুল পাওয়া যায়নি।',
    },
    hero: {
      heading: 'Everything You Need to Edit Images.',
      description:
        'বিনামূল্যে ছবি রিসাইজ, কম্প্রেস, কনভার্ট, ক্রপ এবং এডিট করার অনলাইন টুলস। কোনো সাইনআপ বা সীমা নেই।',
      uploadBtn: 'ছবি আপলোড করুন',
      exploreBtn: 'সব টুলস দেখুন',
      privacyLine: '১০০% ব্রাউজার-ভিত্তিক প্রসেসিং · আপনার ছবি ডিভাইসের বাইরে যায় না',
      chooseToolTitle: 'ছবি লোড হয়েছে — একটি টুল বেছে নিন',
      chooseToolSubtitle: 'এডিট শুরু করতে নিচের যেকোনো টুলে ক্লিক করুন।',
    },
    sections: {
      popularTools: 'জনপ্রিয় টুলস',
      popularSubtitle: 'এক ক্লিকে ব্যবহারযোগ্য দ্রুত এবং ফ্রি ইমেজ ইউটিলিটি।',
      viewAllTools: 'সব ১৫টি টুল দেখুন',
      browseCategories: 'ক্যাটাগরি অনুযায়ী দেখুন',
      categoriesSubtitle: 'সাধারণ এডিটিং, চাকরির ডকুমেন্ট ও পিডিএফ কাজের জন্য সাজানো ক্যাটাগরি।',
      whyChooseTitle: 'কেন Fynof ব্যবহার করবেন',
      whyChooseSubtitle: 'দ্রুত গতি, সহজ ব্যবহার এবং সম্পূর্ণ প্রাইভেসির নিশ্চয়তা।',
      howItWorksTitle: 'যেভাবে কাজ করে',
      howItWorksSubtitle: 'মাত্র তিনটি সহজ ধাপে ছবি এডিট ও ডাউনলোড করুন।',
      faqTitle: 'সচরাচর জিজ্ঞাসিত প্রশ্ন',
      faqSubtitle: 'প্রাইভেসি, ফরম্যাট এবং ব্রাউজার প্রসেসিং সম্পর্কিত সাধারণ প্রশ্নোত্তর।',
      relatedTools: 'সম্পর্কিত টুলস',
      howToUse: 'ব্যবহারের নিয়ম',
      advertisement: 'বিজ্ঞাপন',
    },
    whyChoose: [
      {
        title: '১০০% ফ্রি',
        desc: 'সব টুল, প্রিসেট ও হাই-রেজোলিউশন ডাউনলোড সম্পূর্ণ বিনামূল্যে ব্যবহারযোগ্য।',
      },
      {
        title: 'কোনো সাইনআপ নেই',
        desc: 'অ্যাকাউন্ট তৈরি বা লগইন ছাড়াই সরাসরি যেকোনো টুল ব্যবহার শুরু করুন।',
      },
      {
        title: 'সর্বোচ্চ প্রাইভেসি',
        desc: 'সকল প্রসেসিং আপনার ব্রাউজারে সম্পন্ন হয়; কোনো ছবি সার্ভারে আপলোড হয় না।',
      },
      {
        title: 'আনলিমিটেড ব্যবহার',
        desc: 'প্রতিদিন যত খুশি ছবি, সিগনেচার, পাসপোর্ট শিট ও পিডিএফ প্রসেস করুন।',
      },
    ],
    howItWorks: [
      {
        step: '০১',
        title: 'আপলোড করুন',
        desc: 'আপনার মোবাইল বা কম্পিউটার থেকে JPG, PNG, WEBP বা PDF ফাইল নির্বাচন করুন।',
      },
      {
        step: '০২',
        title: 'এডিট করুন',
        desc: 'লাইভ প্রিভিউ দেখে সাইজ, কম্প্রেশন, ক্রপ, ফিল্টার বা লেআউট পরিবর্তন করুন।',
      },
      {
        step: '০৩',
        title: 'ডাউনলোড করুন',
        desc: 'কোনো ওয়াটারমার্ক ছাড়াই পূর্ণ মানের ফাইল তাৎক্ষণিক ডাউনলোড করুন।',
      },
    ],
    editor: {
      dropTitle: 'এখানে ফাইল ড্রপ করুন',
      dropSubtitle: 'অথবা ডিভাইস থেকে ফাইল নির্বাচন করতে ক্লিক করুন',
      browseFiles: 'ফাইল বাছাই করুন',
      supportedFormats: 'JPG, JPEG, PNG, WEBP সমর্থিত',
      privacyNote: '১০০% নিরাপদ · সরাসরি আপনার ব্রাউজারে প্রসেস হয়',
      usePreviousImage: 'আগের লোড করা ছবি ব্যবহার করুন',
      clearImage: 'মুছুন',
      changeImage: 'নতুন ছবি নিন',
      undo: 'আনডু',
      redo: 'রিডু',
      reset: 'রিসেট',
      original: 'আসল ছবি',
      edited: 'এডিট করা',
      compare: 'তুলনা',
      zoomIn: 'জুম ইন',
      zoomOut: 'জুম আউট',
      fit: 'ফিট',
      download: 'ডাউনলোড',
      processing: 'প্রসেস হচ্ছে...',
      before: 'আগে',
      after: 'পরে',
      originalSize: 'আসল সাইজ',
      outputSize: 'নতুন সাইজ',
      saved: 'কমেছে',
      dimensions: 'মাপ (পিক্সেল)',
      openInAnotherTool: 'অন্য টুলে নিয়ে যান',
      errorInvalidFile: 'ফরম্যাট সমর্থিত নয়। অনুগ্রহ করে সঠিক ইমেজ ফাইল আপলোড করুন।',
    },
    footer: {
      tagline: 'Edit Images. Create More. Stay Free.',
      privacyNotice: 'সব ছবি আপনার ব্রাউজারে প্রসেস হয়। কোনো ফাইল সার্ভারে পাঠানো হয় না।',
      navigation: 'নেভিগেশন',
      popular: 'জনপ্রিয় টুলস',
      legal: 'তথ্য ও নীতিমালা',
      about: 'আমাদের সম্পর্কে',
      contact: 'যোগাযোগ',
      privacy: 'প্রাইভেসি পলিসি',
      terms: 'শর্তাবলী',
      allTools: 'সব টুলস',
      copyright: 'Fynof. ফ্রি ক্লায়েন্ট-সাইড ইমেজ টুলস।',
    },
  },
};
