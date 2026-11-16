import { Language, ToolCategoryId, ToolDefinition, ToolFaq } from '../types/tool';

export const CATEGORIES: {
  id: ToolCategoryId;
  name: Record<Language, string>;
  description: Record<Language, string>;
}[] = [
  {
    id: 'basic',
    name: { en: 'Basic Tools', bn: 'বেসিক টুলস' },
    description: {
      en: 'Essential compression, resizing, format conversion, cropping, and rotation.',
      bn: 'কম্প্রেস, রিসাইজ, ফরম্যাট পরিবর্তন, ক্রপ ও রোটেট করার প্রয়োজনীয় টুল।',
    },
  },
  {
    id: 'bangladesh',
    name: { en: 'Bangladesh Special', bn: 'বাংলাদেশ স্পেশাল' },
    description: {
      en: 'Exact pixel & KB presets for Govt Jobs, Teletalk, NID, Passport, and Signatures.',
      bn: 'সরকারি চাকরি, টেলিটক, এনআইডি, পাসপোর্ট ও সিগনেচারের সঠিক মাপ ও কেবি প্রিসেট।',
    },
  },
  {
    id: 'editing',
    name: { en: 'Photo Editing', bn: 'ফটো এডিটিং' },
    description: {
      en: 'Filters, blur privacy brush, watermarks, and custom multi-photo collages.',
      bn: 'ফিল্টার, ফেস ব্লার ব্রাশ, ওয়াটারমার্ক এবং কাস্টম ফটো কোলাজ।',
    },
  },
  {
    id: 'pdf',
    name: { en: 'PDF Tools', bn: 'পিডিএফ টুলস' },
    description: {
      en: 'Convert multiple images into print-ready PDFs or extract high-res pages from PDF.',
      bn: 'একাধিক ছবি থেকে পিডিএফ তৈরি এবং পিডিএফ থেকে হাই-রেজোলিউশন ছবি এক্সট্র্যাক্ট।',
    },
  },
  {
    id: 'advanced',
    name: { en: 'Advanced Tools', bn: 'অ্যাডভান্সড টুলস' },
    description: {
      en: 'Developer and web utilities including Base64 encoding and decoding.',
      bn: 'ডেভেলপার ও ওয়েব ইউটিলিটি যেমন ইমেজ টু Base64 কনভার্সন।',
    },
  },
];

export const TOOLS: ToolDefinition[] = [
  {
    id: 'image-compressor',
    slug: 'image-compressor',
    category: 'basic',
    popular: true,
    iconName: 'Minimize2',
    formatsLabel: 'JPG · PNG · WEBP',
    supportsWorkspaceImage: true,
    name: { en: 'Image Compressor', bn: 'ইমেজ কম্প্রেসর' },
    shortDesc: {
      en: 'Reduce image file size to an exact KB target or quality level.',
      bn: 'নির্দিষ্ট KB সাইজ বা কোয়ালিটি অনুযায়ী ছবির সাইজ কমান।',
    },
    description: {
      en: 'Compress JPG, JPEG, PNG, and WEBP images in your browser with target KB presets (20 KB to 500 KB) and real-time Before/After comparison.',
      bn: 'সরাসরি ব্রাউজারে JPG, JPEG, PNG এবং WEBP ছবির সাইজ কমান। ২০ কেবি থেকে ৫০০ কেবি প্রিসেট এবং Before/After প্রিভিউ সুবিধা।',
    },
    seoTitle: 'Image Compressor – Reduce Image Size in KB Online | Fynof',
    seoDescription:
      'Compress JPG, PNG, and WEBP images online to 20KB, 50KB, 100KB, 200KB, or 500KB with instant before/after preview. 100% private client-side compression.',
    seoOverview: [
      {
        en: 'Fynof Image Compressor shrinks JPG, JPEG, PNG, and WEBP photos locally inside your browser without sacrificing clarity. Use Smart Compression to automatically pick lossless PNG optimization, transparent WEBP conversion, or balanced lossy quality so output files stay genuinely smaller than the original.',
        bn: 'Fynof ইমেজ কম্প্রেসর আপনার ব্রাউজারেই JPG, JPEG, PNG এবং WEBP ছবির মান অক্ষুণ্ণ রেখে সাইজ কমায়। স্মার্ট কম্প্রেশন স্বয়ংক্রিয়ভাবে লসলেস PNG বা স্বচ্ছ WEBP ব্যবহার করে যাতে আউটপুট ফাইল আসলের চেয়ে ছোট হয়।',
      },
      {
        en: 'Need an exact file limit for portals or email attachments? Switch to Target File Size mode and choose 20 KB, 50 KB, 100 KB, 200 KB, 500 KB, or a custom KB value with live Before/After preview.',
        bn: 'অনলাইন ফর্ম বা ইমেইলের জন্য নির্দিষ্ট সাইজ প্রয়োজন হলে Target File Size মোডে ২০ কেবি, ৫০ কেবি, ১০০ কেবি, ২০০ কেবি বা ৫০০ কেবি প্রিসেট বেছে নিয়ে Before/After প্রিভিউ দেখে ডাউনলোড করুন।',
      },
    ],
    howToSteps: [
      {
        en: 'Upload a JPG, PNG, or WEBP image from your device.',
        bn: 'আপনার ডিভাইস থেকে JPG, PNG অথবা WEBP ছবি আপলোড করুন।',
      },
      {
        en: 'Adjust the quality slider or pick a target file size preset (20 KB – 500 KB).',
        bn: 'কোয়ালিটি স্লাইডার সেট করুন অথবা নির্দিষ্ট KB প্রিসেট (২০ কেবি – ৫০০ কেবি) নির্বাচন করুন।',
      },
      {
        en: 'Compare Before and After quality, then click Download.',
        bn: 'Before ও After প্রিভিউ যাচাই করে ডাউনলোড বাটনে ক্লিক করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'Are my photos uploaded to a server during compression?',
          bn: 'কম্প্রেস করার সময় কি আমার ছবি সার্ভারে আপলোড হয়?',
        },
        answer: {
          en: 'No. Fynof processes every image strictly inside your browser using HTML Canvas. Your files never leave your device.',
          bn: 'না। Fynof সম্পূর্ণভাবে আপনার ব্রাউজারের ভেতরে ছবি প্রসেস করে। কোনো ছবি সার্ভারে পাঠানো হয় না।',
        },
      },
      {
        question: {
          en: 'How does target KB compression work for PNG files?',
          bn: 'PNG ছবির জন্য Target KB কীভাবে কাজ করে?',
        },
        answer: {
          en: 'For PNG images, Fynof optimizes color quantization and resolution intelligently when a strict KB limit is requested, or lets you export as WEBP/JPG for maximum savings.',
          bn: 'PNG ছবির ক্ষেত্রে নির্দিষ্ট KB সীমা দিলে Fynof কালার অপ্টিমাইজেশন ও স্কেলিং ব্যবহার করে সাইজ কমায়, অথবা সর্বোচ্চ সেভিংসের জন্য WEBP/JPG ফরম্যাট ব্যবহার করতে পারেন।',
        },
      },
    ],
    relatedIds: ['image-resizer', 'image-converter', 'nid-job-photo-resizer'],
  },
  {
    id: 'image-resizer',
    slug: 'image-resizer',
    category: 'basic',
    popular: true,
    iconName: 'Scaling',
    formatsLabel: 'PX · % · PRESETS',
    supportsWorkspaceImage: true,
    name: { en: 'Image Resizer', bn: 'ইমেজ রিসাইজার' },
    shortDesc: {
      en: 'Resize images by pixels, percentage, or social media presets.',
      bn: 'পিক্সেল, শতাংশ বা সোশ্যাল মিডিয়া প্রিসেট অনুযায়ী ছবি রিসাইজ করুন।',
    },
    description: {
      en: 'Change image dimensions accurately in pixels or percentage with aspect ratio lock and one-click presets for Facebook, YouTube, Instagram, and WhatsApp.',
      bn: 'অ্যাস্পেক্ট রেশিও ঠিক রেখে পিক্সেল বা শতাংশ অনুযায়ী ছবি রিসাইজ করুন। Facebook, YouTube, Instagram ও WhatsApp প্রিসেট রয়েছে।',
    },
    seoTitle: 'Image Resizer – Resize Photos by Pixel or Percent | Fynof',
    seoDescription:
      'Resize images online by custom pixels, percentage, or social media presets including YouTube Thumbnail, Facebook Cover, and Instagram Post. Free and private.',
    seoOverview: [
      {
        en: 'Resize photos to exact pixel dimensions or percentage scales with multi-step high-quality resampling that keeps edges sharp. Toggle Maintain Aspect Ratio to avoid distortion, or pick one-click presets for Facebook Cover, YouTube Thumbnail, Instagram Post, and WhatsApp profile photos.',
        bn: 'সঠিক পিক্সেল বা শতাংশ অনুযায়ী উচ্চমান বজায় রেখে ছবি রিসাইজ করুন। ছবি চ্যাপ্টা না হতে Maintain Aspect Ratio চালু রাখুন অথবা Facebook, YouTube, Instagram ও WhatsApp প্রিসেট ব্যবহার করুন।',
      },
      {
        en: 'All resizing runs strictly in your browser memory—ideal for preparing web banners, product thumbnails, and crisp profile pictures in JPG, PNG, or WEBP.',
        bn: 'সম্পূর্ণ রিসাইজ প্রক্রিয়া আপনার ব্রাউজারে চলে, ফলে কোনো সার্ভার আপলোড ছাড়াই দ্রুত ওয়েব ব্যানার বা প্রোফাইল ছবি তৈরি করা যায়।',
      },
    ],
    howToSteps: [
      {
        en: 'Drop or browse the image you want to resize.',
        bn: 'যে ছবিটি রিসাইজ করতে চান সেটি আপলোড করুন।',
      },
      {
        en: 'Choose Pixel or Percentage mode, enter dimensions, or select a social preset.',
        bn: 'Pixel বা Percentage মোড নির্বাচন করে মাপ দিন অথবা প্রিসেট বাছাই করুন।',
      },
      {
        en: 'Inspect the resized preview and download in your preferred format.',
        bn: 'রিসাইজ প্রিভিউ দেখে আপনার পছন্দের ফরম্যাটে ডাউনলোড করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'Will resizing distort my image?',
          bn: 'রিসাইজ করলে কি ছবি চ্যাপ্টা বা নষ্ট হয়ে যাবে?',
        },
        answer: {
          en: 'Keep "Maintain Aspect Ratio" enabled to automatically scale height proportionally when changing width, preventing any stretching.',
          bn: 'Maintain Aspect Ratio চালু রাখলে প্রস্থ পরিবর্তন করলে উচ্চতা স্বয়ংক্রিয়ভাবে অনুপাতে ঠিক থাকবে, ফলে ছবি চ্যাপ্টা হবে না।',
        },
      },
    ],
    relatedIds: ['image-cropper', 'image-compressor', 'nid-job-photo-resizer'],
  },
  {
    id: 'image-converter',
    slug: 'image-converter',
    category: 'basic',
    popular: true,
    iconName: 'RefreshCw',
    formatsLabel: 'JPG · PNG · WEBP',
    supportsWorkspaceImage: true,
    name: { en: 'Image Converter', bn: 'ইমেজ কনভার্টার' },
    shortDesc: {
      en: 'Convert between JPG, PNG, and WEBP with transparency fill support.',
      bn: 'JPG, PNG এবং WEBP ফরম্যাটে রূপান্তর ও ব্যাকগ্রাউন্ড কালার সুবিধা।',
    },
    description: {
      en: 'Convert JPG to PNG, PNG to JPG, WEBP to JPG/PNG, and more with quality control and custom background fill when converting transparent PNGs to JPG.',
      bn: 'JPG থেকে PNG, PNG থেকে JPG বা WEBP-তে রূপান্তর করুন। স্বচ্ছ PNG থেকে JPG করার সময় পছন্দমতো ব্যাকগ্রাউন্ড কালার যোগ করুন।',
    },
    seoTitle: 'Image Converter – Convert JPG, PNG & WEBP Online | Fynof',
    seoDescription:
      'Convert JPG to PNG, PNG to JPG, JPG to WEBP, and WEBP to PNG/JPG directly in your browser with quality control and transparency background color options.',
    seoOverview: [
      {
        en: 'Switch seamlessly between JPG, PNG, and WEBP formats directly on your device. Whether converting heavy PNG graphics to lightweight WEBP for faster websites or exporting universal JPG files for upload forms, you have complete control over output quality.',
        bn: 'এক ক্লিকে JPG, PNG এবং WEBP ফরম্যাটে ছবি রূপান্তর করুন। ওয়েবসাইটের গতির জন্য WEBP কিংবা যেকোনো ফর্মের জন্য JPG ফরম্যাটে কোয়ালিটি নিয়ন্ত্রণসহ কনভার্ট করা যায়।',
      },
      {
        en: 'When converting transparent PNG or WEBP images to JPG, Fynof automatically detects transparency and lets you choose a clean white or custom background color instead of a dark black box.',
        bn: 'স্বচ্ছ PNG বা WEBP ছবি JPG-তে রূপান্তর করার সময় কালো ব্যাকগ্রাউন্ড এড়াতে Fynof স্বয়ংক্রিয়ভাবে সাদা বা কাস্টম ব্যাকগ্রাউন্ড কালার সেট করার সুবিধা দেয়।',
      },
    ],
    howToSteps: [
      {
        en: 'Upload any JPG, PNG, or WEBP image.',
        bn: 'যেকোনো JPG, PNG বা WEBP ছবি আপলোড করুন।',
      },
      {
        en: 'Select the output format and adjust quality. Pick a background color if converting transparent PNG to JPG.',
        bn: 'আউটপুট ফরম্যাট ও কোয়ালিটি নির্বাচন করুন। স্বচ্ছ PNG থেকে JPG করলে ব্যাকগ্রাউন্ড কালার বেছে নিন।',
      },
      {
        en: 'Preview the converted file size and download immediately.',
        bn: 'নতুন ফাইল সাইজ দেখে সরাসরি ডাউনলোড করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'Why do transparent PNGs turn black when converted to JPG elsewhere?',
          bn: 'অন্য সাইটে স্বচ্ছ PNG-কে JPG করলে ব্যাকগ্রাউন্ড কালো হয়ে যায় কেন?',
        },
        answer: {
          en: 'JPG does not support transparency. Fynof lets you pick a clean white or custom background color before encoding to JPG.',
          bn: 'JPG ফরম্যাট ট্রান্সপারেন্সি সাপোর্ট করে না। Fynof-এ আপনি আগে থেকেই সাদা বা পছন্দমতো ব্যাকগ্রাউন্ড কালার সেট করতে পারবেন।',
        },
      },
    ],
    relatedIds: ['image-compressor', 'image-to-base64', 'image-resizer'],
  },
  {
    id: 'image-cropper',
    slug: 'image-cropper',
    category: 'basic',
    popular: true,
    iconName: 'Crop',
    formatsLabel: 'FREE · 1:1 · 16:9 · 35:45',
    supportsWorkspaceImage: true,
    name: { en: 'Image Cropper', bn: 'ইমেজ ক্রপার' },
    shortDesc: {
      en: 'Crop images freely or with 1:1, 4:3, 16:9, 3:2, and 35:45 ratios.',
      bn: 'ফ্রি ক্রপ বা ১:১, ৪:৩, ১৬:৯, ৩:২ ও ৩৫:৪৫ রেশিওতে ছবি ক্রপ করুন।',
    },
    description: {
      en: 'Interactive drag-and-resize image cropper supporting Free, 1:1, 4:3, 16:9, 3:2, Passport 35:45, and custom aspect ratios with rotation and zoom.',
      bn: 'মাউস বা টাচ দিয়ে সহজে ছবি ক্রপ করুন। Free, 1:1, 4:3, 16:9, 3:2, পাসপোর্ট 35:45 ও কাস্টম রেশিও, রোটেট এবং জুম সুবিধা।',
    },
    seoTitle: 'Image Cropper – Crop Photos & Aspect Ratios Online | Fynof',
    seoDescription:
      'Crop images online with free selection or locked ratios like 1:1, 4:3, 16:9, 3:2, and 35:45 passport size. Includes rotation and zoom controls.',
    seoOverview: [
      {
        en: 'Frame every photograph accurately using interactive drag handles on desktop or touchscreens. Lock common photography ratios including 1:1 square, 4:3, 16:9 widescreen, 3:2 DSLR, and 35:45 passport portrait proportions, or enter any custom ratio.',
        bn: 'ডেস্কটপ ও মোবাইলের টাচস্ক্রিনে সহজে ড্র্যাগ করে ছবি ক্রপ করুন। ১:১, ৪:৩, ১৬:৯, ৩:২, পাসপোর্ট ৩৫:৪৫ কিংবা যেকোনো কাস্টম অ্যাস্পেক্ট রেশিও বেছে নেওয়া যায়।',
      },
      {
        en: 'Combine cropping with instant 90-degree rotation and canvas zoom controls to remove unwanted borders and prepare clean compositions in seconds.',
        bn: 'ক্রপিংয়ের পাশাপাশি ৯০ ডিগ্রি রোটেশন এবং জুম ব্যবহার করে দ্রুত ছবির অপ্রয়োজনীয় অংশ বাদ দিয়ে নিখুঁত ফ্রেম তৈরি করুন।',
      },
    ],
    howToSteps: [
      {
        en: 'Upload the photo you want to crop.',
        bn: 'আপনি যে ছবিটি ক্রপ করতে চান তা আপলোড করুন।',
      },
      {
        en: 'Select an aspect ratio preset or enter a custom ratio, then drag the crop handles.',
        bn: 'প্রয়োজনীয় অ্যাস্পেক্ট রেশিও বেছে নিয়ে ক্রপ বক্সটি ড্র্যাগ করে ঠিক করুন।',
      },
      {
        en: 'Optionally rotate or zoom, preview the result, and download.',
        bn: 'প্রয়োজনে রোটেট বা জুম করে প্রিভিউ দেখে ডাউনলোড করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'Does the cropper work on mobile touchscreens?',
          bn: 'মোবাইলের টাচস্ক্রিনে কি ক্রপ করা যায়?',
        },
        answer: {
          en: 'Yes, all crop handles and canvas panning support pointer and touch gestures smoothly on Android and iOS.',
          bn: 'হ্যাঁ, অ্যান্ড্রয়েড ও আইফোনের টাচস্ক্রিনে খুব সহজে আঙুল দিয়ে ক্রপ বক্স ড্র্যাগ ও রিসাইজ করা যায়।',
        },
      },
    ],
    relatedIds: ['passport-photo-maker', 'image-rotator-flipper', 'image-resizer'],
  },
  {
    id: 'passport-photo-maker',
    slug: 'passport-photo-maker',
    category: 'bangladesh',
    popular: true,
    iconName: 'UserSquare2',
    formatsLabel: '35×45MM · A4 SHEET · PDF',
    supportsWorkspaceImage: true,
    name: { en: 'Passport Photo Maker', bn: 'পাসপোর্ট ফটো মেকার' },
    shortDesc: {
      en: 'Create 35×45 mm or 40×40 mm passport photos and A4 print sheets.',
      bn: '৩৫×৪৫ মিমি বা ৪০×৪০ মিমি পাসপোর্ট ছবি এবং A4 প্রিন্ট শিট তৈরি করুন।',
    },
    description: {
      en: 'Generate exact DPI-calibrated 35×45 mm and 40×40 mm passport photos with White, Light Blue, or custom backgrounds and 2–8 copies on an A4 sheet (JPG & PDF).',
      bn: 'সঠিক DPI অনুযায়ী ৩৫×৪৫ মিমি ও ৪০×৪০ মিমি পাসপোর্ট ছবি তৈরি করুন। সাদা বা হালকা নীল ব্যাকগ্রাউন্ডসহ A4 শিটে ২, ৪, ৬ বা ৮ কপি JPG ও PDF ডাউনলোড।',
    },
    seoTitle: 'Passport Photo Maker – 35x45mm A4 Sheet & PDF | Fynof',
    seoDescription:
      'Create 35x45 mm or 40x40 mm passport size photos with white or light blue background and export 2, 4, 6, or 8 copies on an A4 printable JPG or PDF sheet.',
    seoOverview: [
      {
        en: 'Design studio-ready 35×45 mm passport photos and 40×40 mm visa or ID portraits at true 300 DPI or 600 DPI resolution. Use the optional face alignment guide and smart edge-background replacement to switch studio walls to pure White, Light Blue, or any custom color.',
        bn: '৩০০ বা ৬০০ DPI-তে সঠিক ৩৫×৪৫ মিমি পাসপোর্ট ও ৪০×৪০ মিমি ভিসা ছবি তৈরি করুন। ফেস অ্যালাইনমেন্ট গাইড এবং সাদা বা হালকা নীল ব্যাকগ্রাউন্ড সহজেই সেট করা যায়।',
      },
      {
        en: 'Arrange 2, 4, 6, or 8 calibrated copies onto an exact 210×297 mm A4 print sheet and download as high-resolution JPG or print-ready PDF.',
        bn: 'একটি ২১০×২৯৭ মিমি A4 শিটে ২, ৪, ৬ বা ৮ কপি ছবি সাজিয়ে প্রিন্ট উপযোগী JPG বা PDF হিসেবে ডাউনলোড করুন।',
      },
    ],
    howToSteps: [
      {
        en: 'Upload a front-facing portrait photo.',
        bn: 'সামনে তাকানো একটি স্পষ্ট পোর্ট্রেট ছবি আপলোড করুন।',
      },
      {
        en: 'Choose 35×45 mm or 40×40 mm, adjust framing zoom, and set background color or smart backdrop.',
        bn: '৩৫×৪৫ মিমি বা ৪০×৪০ মিমি সাইজ বেছে নিয়ে ছবি জুম/পজিশন ঠিক করুন এবং ব্যাকগ্রাউন্ড কালার দিন।',
      },
      {
        en: 'Choose 2, 4, 6, or 8 copies on A4 sheet and download as printable JPG or PDF.',
        bn: 'A4 শিটে ২, ৪, ৬ বা ৮ কপি নির্বাচন করে প্রিন্ট করার উপযোগী JPG বা PDF ডাউনলোড করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'Are the physical print dimensions accurate when printed on A4 paper?',
          bn: 'A4 কাগজে প্রিন্ট করলে কি ছবির আসল মিলিমিটার মাপ ঠিক থাকবে?',
        },
        answer: {
          en: 'Yes. Fynof calculates pixel dimensions directly from 300 DPI or 600 DPI physical millimeter math and generates true 210×297 mm PDF sheets.',
          bn: 'হ্যাঁ। Fynof ৩০০ বা ৬০০ DPI অনুযায়ী সঠিক মিলিমিটার থেকে পিক্সেল হিসাব করে এবং ২১০×২৯৭ মিমি A4 PDF তৈরি করে।',
        },
      },
    ],
    relatedIds: ['nid-job-photo-resizer', 'signature-resizer', 'image-cropper'],
  },
  {
    id: 'image-to-pdf',
    slug: 'image-to-pdf',
    category: 'pdf',
    popular: true,
    iconName: 'FileText',
    formatsLabel: 'MULTI-IMAGE · A4 · A5',
    supportsWorkspaceImage: false,
    name: { en: 'Image to PDF', bn: 'ইমেজ টু পিডিএফ' },
    shortDesc: {
      en: 'Combine multiple images into a single A4, A5, or custom PDF.',
      bn: 'একাধিক ছবি সাজিয়ে একটি A4, A5 বা কাস্টম PDF তৈরি করুন।',
    },
    description: {
      en: 'Select multiple photos, reorder pages, choose A4, A5, or custom size, portrait/landscape orientation, margins, and quality to generate a clean PDF.',
      bn: 'একাধিক ছবি নির্বাচন করে ক্রম সাজান। A4, A5 বা কাস্টম পেজ সাইজ, পোর্ট্রেট/ল্যান্ডস্কেপ, মার্জিন ও কোয়ালিটি সেট করে PDF ডাউনলোড করুন।',
    },
    seoTitle: 'Image to PDF – Combine Photos into One PDF Free | Fynof',
    seoDescription:
      'Convert JPG, PNG, and WEBP images to PDF online. Reorder pages, set A4/A5 page size, portrait or landscape orientation, margins, and quality for free.',
    seoOverview: [
      {
        en: 'Merge multiple scans, certificates, receipts, or photos into one organized PDF document right inside your browser. Reorder pages effortlessly, switch between A4, A5, or custom millimeter dimensions, and set Portrait or Landscape orientation.',
        bn: 'একাধিক সার্টিফিকেট, নথি বা ছবি ব্রাউজারেই একটি সুবিন্যস্ত PDF ফাইলে যুক্ত করুন। পেজের ক্রম পরিবর্তন, A4/A5 বা কাস্টম সাইজ এবং পোর্ট্রেট/ল্যান্ডস্কেপ সেট করা যায়।',
      },
      {
        en: 'Customize page margins and compression quality to balance sharp document readability with compact file size for academic or job portal uploads.',
        bn: 'লেখা স্পষ্ট রেখে ফাইল সাইজ ছোট রাখতে পেজ মার্জিন এবং PDF কোয়ালিটি প্রয়োজনমতো সমন্বয় করুন।',
      },
    ],
    howToSteps: [
      {
        en: 'Upload one or multiple images at once.',
        bn: 'একসঙ্গে এক বা একাধিক ছবি আপলোড করুন।',
      },
      {
        en: 'Drag or move images to set the page order, then pick page size, orientation, and margin.',
        bn: 'ছবির ক্রম সাজান এবং পেজ সাইজ (A4/A5), ওরিয়েন্টেশন ও মার্জিন নির্বাচন করুন।',
      },
      {
        en: 'Click Download PDF to save your document.',
        bn: 'Download PDF বাটনে ক্লিক করে ফাইলটি সেভ করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'Is there a limit on how many images I can add to a PDF?',
          bn: 'একটি PDF-এ কয়টি ছবি যুক্ত করা যাবে?',
        },
        answer: {
          en: 'There is no artificial limit. Processing happens in your device memory, so you can combine dozens of images comfortably.',
          bn: 'কোনো নির্দিষ্ট সীমা নেই। আপনার ডিভাইসের মেমোরি অনুযায়ী অনায়াসে অনেকগুলো ছবি যুক্ত করতে পারবেন।',
        },
      },
    ],
    relatedIds: ['pdf-to-image', 'passport-photo-maker', 'image-compressor'],
  },
  {
    id: 'pdf-to-image',
    slug: 'pdf-to-image',
    category: 'pdf',
    popular: false,
    iconName: 'Images',
    formatsLabel: 'PDF · JPG · PNG · ZIP',
    supportsWorkspaceImage: false,
    name: { en: 'PDF to Image', bn: 'পিডিএফ টু ইমেজ' },
    shortDesc: {
      en: 'Render PDF pages to high-resolution JPG or PNG and download as ZIP.',
      bn: 'PDF-এর পেজ হাই-রেজোলিউশন JPG/PNG হিসেবে এক্সট্র্যাক্ট ও ZIP ডাউনলোড করুন।',
    },
    description: {
      en: 'Preview PDF pages directly in your browser, pick specific pages or all pages, select output resolution, and export as JPG, PNG, or a single ZIP archive.',
      bn: 'ব্রাউজারে PDF-এর সব পেজ প্রিভিউ করুন। নির্দিষ্ট পেজ বা সব পেজ JPG/PNG ফরম্যাটে এবং একসঙ্গে ZIP আকারে ডাউনলোড করুন।',
    },
    seoTitle: 'PDF to Image – Convert PDF Pages to JPG & PNG | Fynof',
    seoDescription:
      'Convert PDF pages to high-resolution JPG or PNG images in your browser. Select individual pages or export all pages together as a ZIP file.',
    seoOverview: [
      {
        en: 'Extract crisp images from any PDF document without uploading confidential files to third-party servers. Preview every page thumbnail, type custom page ranges (such as 1, 3-5) or select all pages, and render at 1x to 4x resolution.',
        bn: 'কোনো সার্ভারে ফাইল আপলোড ছাড়াই যেকোনো PDF থেকে স্পষ্ট ছবি বের করুন। সব পেজ প্রিভিউ করে নির্দিষ্ট পেজ রেঞ্জ (যেমন 1, 3-5) বা সব পেজ ১x থেকে ৪x রেজোলিউশনে কনভার্ট করুন।',
      },
      {
        en: 'Download individual pages as JPG or PNG, or bundle every extracted page into a single convenient ZIP archive.',
        bn: 'আলাদা JPG/PNG ছবি হিসেবে অথবা সব পেজ একসাথে একটি ZIP ফাইল আকারে ডাউনলোড করতে পারবেন।',
      },
    ],
    howToSteps: [
      {
        en: 'Upload a PDF file from your computer or phone.',
        bn: 'আপনার ডিভাইস থেকে একটি PDF ফাইল আপলোড করুন।',
      },
      {
        en: 'Preview all pages, select specific pages or All Pages, and pick JPG/PNG and resolution.',
        bn: 'পেজগুলো প্রিভিউ করে নির্দিষ্ট পেজ বা সব পেজ নির্বাচন করুন এবং ফরম্যাট ও রেজোলিউশন সেট করুন।',
      },
      {
        en: 'Download individual images or export all selected pages in a ZIP archive.',
        bn: 'আলাদা ছবি হিসেবে অথবা একসঙ্গে ZIP আকারে ডাউনলোড করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'Which resolution should I choose for crisp text?',
          bn: 'লেখা স্পষ্ট দেখানোর জন্য কোন রেজোলিউশন ভালো?',
        },
        answer: {
          en: 'Select 2x (144 DPI) for screen sharing or 3x–4x (216–300 DPI) when you need print-grade clarity.',
          bn: 'স্ক্রিনে দেখার জন্য 2x (144 DPI) এবং প্রিন্ট বা স্পষ্ট লেখার জন্য 3x–4x (216–300 DPI) বেছে নিন।',
        },
      },
    ],
    relatedIds: ['image-to-pdf', 'image-converter', 'image-compressor'],
  },
  {
    id: 'signature-resizer',
    slug: 'signature-resizer',
    category: 'bangladesh',
    popular: false,
    iconName: 'PenTool',
    formatsLabel: '300×80 PX · 20 KB',
    supportsWorkspaceImage: true,
    name: { en: 'Signature Resizer', bn: 'সিগনেচার রিসাইজার' },
    shortDesc: {
      en: 'Crop, clean to black & white, and resize signatures to 300×80 px (20 KB).',
      bn: 'স্বাক্ষর ক্রপ, সাদাকালো ক্লিন এবং ৩০০×৮০ পিক্সেল (২০ কেবি) করুন।',
    },
    description: {
      en: 'Prepare job application signatures with the standard 300×80 px preset, 20 KB file size limiter, Black & White ink cleanup, and interactive cropping.',
      bn: 'চাকরির আবেদনের জন্য ৩০০×৮০ পিক্সেল প্রিসেট, ২০ কেবি ফাইল সাইজ টার্গেট, সাদাকালো কনট্রাস্ট ও ক্রপসহ সিগনেচার প্রস্তুত করুন।',
    },
    seoTitle: 'Signature Resizer – 300x80 px & 20 KB Online Tool | Fynof',
    seoDescription:
      'Resize and crop signature photos to 300x80 px and under 20 KB for Bangladesh Govt jobs, BCS, Teletalk, and bank applications. Includes Black & White cleanup.',
    seoOverview: [
      {
        en: 'Tailored for Bangladesh government job portals, BCS, Teletalk, and bank recruitment forms requiring an exact 300×80 px signature under 20 KB. Crop tightly around your handwritten ink and optionally enable Black & White mode to remove grey paper shadows.',
        bn: 'সরকারি চাকরি, বিসিএস, টেলিটক ও ব্যাংক আবেদনের ৩০০×৮০ পিক্সেল এবং ২০ কেবি-র কম সিগনেচার তৈরির জন্য বিশেষভাবে নির্মিত। Black & White মোডে কাগজের ছায়া দূর করে কালি স্পষ্ট করা যায়।',
      },
      {
        en: 'Automatic KB compression ensures your exported JPG or PNG signature passes strict portal validation on the first attempt.',
        bn: 'স্বয়ংক্রিয় KB টার্গেট থাকায় আপনার এক্সপোর্ট করা JPG বা PNG সিগনেচার প্রথমবারেই আবেদন পোর্টালে গৃহীত হবে।',
      },
    ],
    howToSteps: [
      {
        en: 'Upload a photo or scan of your handwritten signature.',
        bn: 'সাদা কাগজে করা আপনার স্বাক্ষরের ছবি আপলোড করুন।',
      },
      {
        en: 'Crop tightly around the signature, optionally enable Black & White mode, and choose 300×80 px.',
        bn: 'স্বাক্ষরের চারপাশ ক্রপ করুন, প্রয়োজনে Black & White চালু করুন এবং ৩০০×৮০ পিক্সেল প্রিসেট নিন।',
      },
      {
        en: 'Verify live file size is under 20 KB and download JPG or PNG.',
        bn: 'ফাইল সাইজ ২০ কেবি-র নিচে নিশ্চিত হয়ে JPG বা PNG ডাউনলোড করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'What does the Black & White option do?',
          bn: 'Black & White অপশন কী কাজ করে?',
        },
        answer: {
          en: 'It removes grey paper shadows and enhances contrast so your signature ink appears sharp on a pure white background.',
          bn: 'এটি কাগজের ধূসর ছায়া দূর করে এবং স্বাক্ষরের কালি আরও গাঢ় ও স্পষ্ট করে সাদা ব্যাকগ্রাউন্ড দেয়।',
        },
      },
    ],
    relatedIds: ['nid-job-photo-resizer', 'passport-photo-maker', 'image-cropper'],
  },
  {
    id: 'nid-job-photo-resizer',
    slug: 'nid-job-photo-resizer',
    category: 'bangladesh',
    popular: false,
    iconName: 'IdCard',
    formatsLabel: '300×300 PX · 20–100 KB',
    supportsWorkspaceImage: true,
    name: { en: 'NID / Job Photo Resizer', bn: 'NID / জব ফটো রিসাইজার' },
    shortDesc: {
      en: 'Resize applicant photos to 300×300 px with 20, 50, or 100 KB target.',
      bn: '৩০০×৩০০ পিক্সেল ও ২০, ৫০ বা ১০০ কেবি টার্গেটে চাকরির ছবি তৈরি করুন।',
    },
    description: {
      en: 'Built for Teletalk, BCS, Bank, and NID portals: frame your photo to 300×300 px or custom dimensions with live 20 KB, 50 KB, or 100 KB file size targeting.',
      bn: 'টেলিটক, বিসিএস, ব্যাংক ও NID আবেদনের জন্য ৩০০×৩০০ পিক্সেল (বা কাস্টম মাপ) এবং লাইভ ২০, ৫০ বা ১০০ কেবি টার্গেট সাইজসহ JPG এক্সপোর্ট।',
    },
    seoTitle: 'NID & Job Photo Resizer – 300x300 px under 100 KB | Fynof',
    seoDescription:
      'Resize job application and NID photos to 300x300 px with exact 20 KB, 50 KB, or 100 KB file size targets and live JPG size preview.',
    seoOverview: [
      {
        en: 'Prepare compliant candidate photos for Teletalk, BCS, Bangladesh Bank, university admissions, and NID updates in seconds. Frame your headshot inside the 300×300 px preset or specify custom pixel dimensions.',
        bn: 'টেলিটক, বিসিএস, ব্যাংক, বিশ্ববিদ্যালয় ভর্তি এবং NID ফর্মের জন্য ৩০০×৩০০ পিক্সেল বা কাস্টম মাপের ছবি সহজে তৈরি করুন।',
      },
      {
        en: 'Select a 20 KB, 50 KB, or 100 KB limit with live JPG byte calculation so you know the exact output size before downloading.',
        bn: 'লাইভ ফাইল সাইজ প্রিভিউ দেখে ২০ কেবি, ৫০ কেবি বা ১০০ কেবি সীমার মধ্যে নিখুঁত JPG ছবি ডাউনলোড করুন।',
      },
    ],
    howToSteps: [
      {
        en: 'Upload your portrait photo.',
        bn: 'আপনার পোর্ট্রেট ছবিটি আপলোড করুন।',
      },
      {
        en: 'Adjust framing in the 300×300 px square box (or enter custom dimensions) and select 20 KB, 50 KB, or 100 KB.',
        bn: '৩০০×৩০০ পিক্সেল বক্সে ছবি ফ্রেম করুন এবং ২০, ৫০ বা ১০০ কেবি টার্গেট সাইজ নির্বাচন করুন।',
      },
      {
        en: 'Check the live KB readout and download your compliant JPG.',
        bn: 'লাইভ KB সাইজ দেখে আপনার JPG ছবিটি ডাউনলোড করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'Does this meet Bangladesh Teletalk & Govt Job photo requirements?',
          bn: 'এটি কি টেলিটক ও সরকারি চাকরির ছবির নিয়ম মেনে কাজ করে?',
        },
        answer: {
          en: 'Yes. Standard Teletalk portals require 300×300 px JPG under 100 KB, which is the default preset.',
          bn: 'হ্যাঁ। টেলিটক পোর্টালে সাধারণত ৩০০×৩০০ পিক্সেল এবং ১০০ কেবি-র কম JPG প্রয়োজন হয়, যা এখানে ডিফল্ট প্রিসেট হিসেবে আছে।',
        },
      },
    ],
    relatedIds: ['signature-resizer', 'passport-photo-maker', 'image-compressor'],
  },
  {
    id: 'photo-collage-maker',
    slug: 'photo-collage-maker',
    category: 'editing',
    popular: false,
    iconName: 'LayoutGrid',
    formatsLabel: '2 · 4 · 6 · 9 PHOTOS',
    supportsWorkspaceImage: false,
    name: { en: 'Photo Collage Maker', bn: 'ফটো কোলাজ মেকার' },
    shortDesc: {
      en: 'Arrange 2, 4, 6, or 9 photos into custom grids with borders and radius.',
      bn: '২, ৪, ৬ বা ৯টি ছবি বর্ডার ও রাউন্ডেড কর্নারসহ কোলাজ তৈরি করুন।',
    },
    description: {
      en: 'Upload multiple photos, drag and drop to swap cells, customize border size, border color, rounded corners, and canvas dimensions, then export JPG or PNG.',
      bn: 'একাধিক ছবি আপলোড করে ড্র্যাগ অ্যান্ড ড্রপ দিয়ে অবস্থান বদলান। বর্ডার সাইজ, কালার, রাউন্ডেড কর্নার ও ক্যানভাস সাইজ কাস্টমাইজ করুন।',
    },
    seoTitle: 'Photo Collage Maker – 2, 4, 6 & 9 Photo Grids Free | Fynof',
    seoDescription:
      'Create custom 2, 4, 6, and 9 photo collages online. Drag and drop to reorder photos, customize borders, rounded corners, and download JPG or PNG.',
    seoOverview: [
      {
        en: 'Combine 2, 4, 6, or 9 memories into clean grid layouts or split collages without installing heavy apps. Swap any tile by dragging or tapping Swap, replace individual photos, and fine-tune grid borders, background colors, and rounded corners.',
        bn: 'কোনো অ্যাপ ছাড়াই ২, ৪, ৬ বা ৯টি ছবি সুন্দর গ্রিড লেআউটে সাজান। ড্র্যাগ বা সোয়াপ করে ছবির জায়গা বদলান এবং বর্ডার, কালার ও রাউন্ডেড কর্নার কাস্টমাইজ করুন।',
      },
      {
        en: 'Export crisp high-resolution JPG or PNG collages ready for Instagram posts, family albums, or product comparisons.',
        bn: 'সোশ্যাল মিডিয়া পোস্ট বা প্রোডাক্ট তুলনার জন্য হাই-রেজোলিউশন JPG বা PNG ফরম্যাটে কোলাজ সেভ করুন।',
      },
    ],
    howToSteps: [
      {
        en: 'Choose a 2, 4, 6, or 9 photo layout and upload your images.',
        bn: '২, ৪, ৬ বা ৯ ছবির লেআউট নির্বাচন করে ছবিগুলো আপলোড করুন।',
      },
      {
        en: 'Drag any cell onto another to swap positions and customize border spacing, colors, and corner radius.',
        bn: 'ছবি ড্র্যাগ করে পজিশন বদলান এবং বর্ডার, কালার ও রাউন্ডেড কর্নার ঠিক করুন।',
      },
      {
        en: 'Download your finished collage as JPG or PNG.',
        bn: 'তৈরি করা কোলাজটি JPG বা PNG ফরম্যাটে ডাউনলোড করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'Can I reorder photos after uploading?',
          bn: 'আপলোড করার পর কি ছবির জায়গা পরিবর্তন করা যাবে?',
        },
        answer: {
          en: 'Yes, simply drag one photo tile onto another (or use swap controls on mobile) to rearrange your collage.',
          bn: 'হ্যাঁ, এক ছবির ওপর আরেকটি ড্র্যাগ করে অথবা মোবাইলে সোয়াপ বাটনের মাধ্যমে সহজে জায়গা বদলাতে পারবেন।',
        },
      },
    ],
    relatedIds: ['image-filters', 'image-watermark', 'image-resizer'],
  },
  {
    id: 'image-rotator-flipper',
    slug: 'image-rotator-flipper',
    category: 'basic',
    popular: false,
    iconName: 'RotateCw',
    formatsLabel: '90° · 180° · 270° · FLIP',
    supportsWorkspaceImage: true,
    name: { en: 'Image Rotator & Flipper', bn: 'ইমেজ রোটেটর ও ফ্লিপার' },
    shortDesc: {
      en: 'Rotate photos 90°, 180°, 270° or flip horizontally and vertically.',
      bn: 'ছবি ৯০°, ১৮০°, ২৭০° রোটেট এবং হরাইজন্টাল বা ভার্টিক্যাল ফ্লিপ করুন।',
    },
    description: {
      en: 'Fix upside-down or mirrored photos with 90°, 180°, 270° rotation, fine straightening, horizontal/vertical flipping, Undo/Redo, and instant download.',
      bn: 'উল্টানো বা বাঁকা ছবি ৯০°, ১৮০°, ২৭০° রোটেট করুন, অনুভূমিক বা উল্লম্ব ফ্লিপ করুন এবং Undo/Redo সুবিধাসহ ডাউনলোড করুন।',
    },
    seoTitle: 'Image Rotator & Flipper – Rotate Photos Online | Fynof',
    seoDescription:
      'Rotate images 90, 180, or 270 degrees and flip horizontally or vertically online with lossless quality and instant download.',
    seoOverview: [
      {
        en: 'Fix sideways phone photos, scanned documents, or mirrored selfies in one click. Rotate cleanly by 90°, 180°, or 270° with automatic canvas dimension adjustment, apply horizontal or vertical mirroring, or dial in custom straightening angles.',
        bn: 'মোবাইলে তোলা বাঁকা ছবি বা উল্টো স্ক্যান ডকুমেন্ট এক ক্লিকে ৯০°, ১৮০° বা ২৭০° রোটেট করুন অথবা হরাইজন্টাল ও ভার্টিক্যাল ফ্লিপ করুন।',
      },
      {
        en: 'Full Undo/Redo history and live output dimension readouts ensure accurate orientation before saving.',
        bn: 'Undo/Redo সুবিধা এবং লাইভ পিক্সেল ডাইমেনশন দেখে নিখুঁত অবস্থায় ছবি ডাউনলোড করা যায়।',
      },
    ],
    howToSteps: [
      {
        en: 'Upload the image you need to rotate or mirror.',
        bn: 'রোটেট বা ফ্লিপ করার জন্য ছবিটি আপলোড করুন।',
      },
      {
        en: 'Click Rotate 90°/180°/270° or Flip Horizontal/Vertical until the orientation looks right.',
        bn: 'প্রয়োজনীয় রোটেট বা ফ্লিপ বাটনে ক্লিক করে ছবির দিক ঠিক করুন।',
      },
      {
        en: 'Download the corrected image.',
        bn: 'সঠিক করা ছবিটি ডাউনলোড করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'Does rotating 90 degrees crop my photo?',
          bn: '৯০ ডিগ্রি রোটেট করলে কি ছবির অংশ কেটে যায়?',
        },
        answer: {
          en: 'No. The canvas automatically swaps width and height so the full image stays intact.',
          bn: 'না। ক্যানভাস স্বয়ংক্রিয়ভাবে প্রস্থ ও উচ্চতা বদলে নেয়, তাই পুরো ছবি অক্ষত থাকে।',
        },
      },
    ],
    relatedIds: ['image-cropper', 'image-resizer', 'image-filters'],
  },
  {
    id: 'image-watermark',
    slug: 'image-watermark',
    category: 'editing',
    popular: false,
    iconName: 'Stamp',
    formatsLabel: 'TEXT · LOGO · OPACITY',
    supportsWorkspaceImage: true,
    name: { en: 'Image Watermark', bn: 'ইমেজ ওয়াটারমার্ক' },
    shortDesc: {
      en: 'Add customizable text or logo watermarks with opacity and rotation.',
      bn: 'ছবিতে কাস্টম টেক্সট বা লোগো ওয়াটারমার্ক, অপাসিটি ও রোটেশন যুক্ত করুন।',
    },
    description: {
      en: 'Protect your photos with custom text or transparent PNG logo watermarks. Adjust font size, color, opacity, rotation angle, and exact grid or tiled placement.',
      bn: 'আপনার ছবি সুরক্ষিত রাখতে টেক্সট বা লোগো ওয়াটারমার্ক বসান। ফন্ট সাইজ, কালার, অপাসিটি, রোটেশন ও পজিশন নিয়ন্ত্রণ করুন।',
    },
    seoTitle: 'Image Watermark – Add Text or Logo Watermark | Fynof',
    seoDescription:
      'Add custom text or logo watermarks to images in your browser. Control font size, color, opacity, rotation, and position with instant preview.',
    seoOverview: [
      {
        en: 'Protect photography portfolios, online store product shots, and official documents with custom text or transparent PNG logo watermarks. Adjust font size, color, opacity, rotation angle, and corner, center, or full-frame tiled placement.',
        bn: 'আপনার তোলা ছবি, ই-কমার্স প্রোডাক্ট বা ডকুমেন্ট সুরক্ষিত রাখতে কাস্টম টেক্সট বা PNG লোগো ওয়াটারমার্ক যুক্ত করুন। সাইজ, কালার, অপাসিটি, রোটেশন ও টাইলড পজিশন নিয়ন্ত্রণ করা যায়।',
      },
      {
        en: 'Choose JPG, PNG, or WEBP export and preview every watermark adjustment live without server uploads.',
        bn: 'লাইভ প্রিভিউ দেখে JPG, PNG অথবা WEBP ফরম্যাটে ওয়াটারমার্কযুক্ত ছবি সেভ করুন।',
      },
    ],
    howToSteps: [
      {
        en: 'Upload your base photo.',
        bn: 'আপনার মূল ছবিটি আপলোড করুন।',
      },
      {
        en: 'Choose Text or Logo watermark, then configure size, color, opacity, rotation, and position.',
        bn: 'Text অথবা Logo বেছে নিয়ে সাইজ, কালার, অপাসিটি, রোটেশন ও পজিশন ঠিক করুন।',
      },
      {
        en: 'Download the watermarked image in full resolution.',
        bn: 'ওয়াটারমার্কযুক্ত ছবিটি পূর্ণ রেজোলিউশনে ডাউনলোড করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'Can I tile a watermark diagonally across the entire image?',
          bn: 'পুরো ছবিতে কি কোনাকুনি টাইলড ওয়াটারমার্ক দেওয়া যায়?',
        },
        answer: {
          en: 'Yes, choose the "Tiled Grid" position option and set rotation to -30° for full-frame protection.',
          bn: 'হ্যাঁ, Position অপশনে "Tiled" বেছে নিয়ে রোটেশন -৩০° সেট করলে পুরো ছবিতে জলছাপ বসবে।',
        },
      },
    ],
    relatedIds: ['image-filters', 'photo-collage-maker', 'image-converter'],
  },
  {
    id: 'image-blur-tool',
    slug: 'image-blur-tool',
    category: 'editing',
    popular: false,
    iconName: 'Droplets',
    formatsLabel: 'BRUSH · FACE · PIXELATE',
    supportsWorkspaceImage: true,
    name: { en: 'Image Blur Tool', bn: 'ইমেজ ব্লার টুল' },
    shortDesc: {
      en: 'Blur faces, license plates, or selected regions with brush or pixelate.',
      bn: 'ব্রাশ বা বক্স সিলেকশন দিয়ে মুখ, নম্বরপ্লেট বা নির্দিষ্ট অংশ ব্লার ও পিক্সেলেট করুন।',
    },
    description: {
      en: 'Protect privacy by brushing smooth Gaussian blur or mosaic pixelation over faces, text, or sensitive details, with box-region selection and Undo/Redo.',
      bn: 'গোপনীয়তা রক্ষায় ব্রাশ বা বক্স সিলেকশনের মাধ্যমে মুখ, লেখা বা সংবেদনশীল অংশ ব্লার অথবা পিক্সেলেট করুন। Undo ও Redo সুবিধা রয়েছে।',
    },
    seoTitle: 'Image Blur Tool – Blur Faces & Pixelate Online | Fynof',
    seoDescription:
      'Blur faces, sensitive text, or selected areas in images using a brush or box selector with Gaussian blur and pixelate modes. 100% private.',
    seoOverview: [
      {
        en: 'Censor faces, license plates, phone numbers, or sensitive document fields before sharing images online. Choose smooth Gaussian Blur or Mosaic Pixelate, paint freely with an interpolated brush that stays gap-free on fast swipes, or drag a precise rectangular box.',
        bn: 'ছবি শেয়ার করার আগে মুখ, নম্বরপ্লেট, ফোন নম্বর বা গোপন তথ্য আড়াল করুন। মসৃণ Gaussian ব্লার বা পিক্সেলেট মোডে ব্রাশ বা বক্স সিলেকশন ব্যবহার করা যায়।',
      },
      {
        en: 'Because all pixel processing stays inside your browser memory, private images are never sent over the internet.',
        bn: 'সম্পূর্ণ কাজ আপনার ডিভাইসের ব্রাউজারেই হয় বলে সংবেদনশীল ছবি কখনোই ইন্টারনেটে আপলোড হয় না।',
      },
    ],
    howToSteps: [
      {
        en: 'Upload the image containing areas you want to hide.',
        bn: 'যে ছবির অংশবিশেষ ঝাপসা করতে চান তা আপলোড করুন।',
      },
      {
        en: 'Choose Brush Blur, Face Brush, or Selected Box mode, pick Gaussian Blur or Pixelate, and paint over the target area.',
        bn: 'Brush, Face অথবা Box মোড বেছে নিয়ে ব্লার বা পিক্সেলেট ইনটেনসিটি সেট করে নির্দিষ্ট স্থানে ড্র্যাগ করুন।',
      },
      {
        en: 'Use Undo/Redo if needed and download the protected image.',
        bn: 'প্রয়োজনে Undo/Redo করে চূড়ান্ত ছবিটি ডাউনলোড করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'Is blurred content permanently obscured in the downloaded file?',
          bn: 'ডাউনলোড করা ছবিতে কি ব্লার অংশ স্থায়ীভাবে ঢেকে যায়?',
        },
        answer: {
          en: 'Yes. The pixels in the exported image are irreversibly blurred or pixelated—no original unblurred layer is saved.',
          bn: 'হ্যাঁ। এক্সপোর্ট করা ছবির পিক্সেল স্থায়ীভাবে পরিবর্তন হয়ে যায়, ফলে মূল তথ্য আর পুনরুদ্ধার করা সম্ভব নয়।',
        },
      },
    ],
    relatedIds: ['image-filters', 'image-watermark', 'image-cropper'],
  },
  {
    id: 'image-filters',
    slug: 'image-filters',
    category: 'editing',
    popular: false,
    iconName: 'SlidersHorizontal',
    formatsLabel: 'PRESETS · SHARPEN · TONE',
    supportsWorkspaceImage: true,
    name: { en: 'Image Filters', bn: 'ইমেজ ফিল্টারস' },
    shortDesc: {
      en: 'Apply Grayscale, Sepia, Vintage, Brightness, Contrast, and Sharpen.',
      bn: 'Grayscale, Sepia, Vintage, Brightness, Contrast ও Sharpen প্রয়োগ করুন।',
    },
    description: {
      en: 'Enhance photos with curated presets (Grayscale, Sepia, Vintage) and precision sliders for Brightness, Contrast, Saturation, Blur, Sharpen, and Intensity.',
      bn: 'Grayscale, Sepia, Vintage প্রিসেট এবং Brightness, Contrast, Saturation, Blur, Sharpen ও Intensity স্লাইডার দিয়ে ছবি সুন্দর করুন।',
    },
    seoTitle: 'Image Filters – Photo Effects & Color Editor | Fynof',
    seoDescription:
      'Apply Grayscale, Sepia, Vintage filters and adjust brightness, contrast, saturation, blur, and sharpen online with real-time before/after preview.',
    seoOverview: [
      {
        en: 'Retouch portraits, product photos, and scanned documents with instant Grayscale, Sepia, and Vintage presets plus independent Brightness, Contrast, Saturation, Blur, Sharpen, and Intensity controls. Heavy 3×3 sharpen convolution runs smoothly in a Web Worker.',
        bn: 'Grayscale, Sepia ও Vintage ফিল্টার এবং Brightness, Contrast, Saturation, Blur ও Sharpen স্লাইডার দিয়ে ছবি নিখুঁত করুন। শার্পেন প্রসেসিং দ্রুত করতে ওয়েব ওয়ার্কার ব্যবহার করা হয়েছে।',
      },
      {
        en: 'Use the interactive Before/After split slider to verify color balance and crispness before downloading.',
        bn: 'Before/After স্লাইডারের মাধ্যমে মূল ও এডিট করা ছবির পার্থক্য যাচাই করে ডাউনলোড করুন।',
      },
    ],
    howToSteps: [
      {
        en: 'Upload a photo into the filter editor.',
        bn: 'ফিল্টার এডিটরে একটি ছবি আপলোড করুন।',
      },
      {
        en: 'Pick a preset look or fine-tune brightness, contrast, saturation, blur, sharpen, and intensity.',
        bn: 'যেকোনো প্রিসেট বেছে নিন অথবা Brightness, Contrast, Saturation, Blur ও Sharpen অ্যাডজাস্ট করুন।',
      },
      {
        en: 'Compare Before/After and download your edited photo.',
        bn: 'Before ও After দেখে এডিট করা ছবিটি ডাউনলোড করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'Can I combine multiple adjustments with a preset?',
          bn: 'একটি প্রিসেটের সাথে কি একাধিক অ্যাডজাস্টমেন্ট ব্যবহার করা যায়?',
        },
        answer: {
          en: 'Yes, presets set balanced starting curves that you can freely customize with Brightness, Contrast, Saturation, and Sharpen.',
          bn: 'হ্যাঁ, প্রিসেট সিলেক্ট করার পরও আপনি স্লাইডার দিয়ে Brightness, Contrast, Saturation ও Sharpen কাস্টমাইজ করতে পারবেন।',
        },
      },
    ],
    relatedIds: ['image-blur-tool', 'image-watermark', 'image-rotator-flipper'],
  },
  {
    id: 'image-to-base64',
    slug: 'image-to-base64',
    category: 'advanced',
    popular: false,
    iconName: 'Code2',
    formatsLabel: 'BASE64 ⇄ JPG · PNG · WEBP',
    supportsWorkspaceImage: true,
    name: { en: 'Image to Base64 / Base64 to Image', bn: 'ইমেজ টু Base64 / Base64 টু ইমেজ' },
    shortDesc: {
      en: 'Encode images to Base64 strings or decode Base64 back to image files.',
      bn: 'ছবিকে Base64 স্ট্রিংয়ে রূপান্তর এবং Base64 থেকে ছবি ডাউনলোড করুন।',
    },
    description: {
      en: 'Two-way developer tool to convert JPG, PNG, and WEBP images into Data URI / Base64 strings with one-click copy, or decode Base64 strings back into downloadable images.',
      bn: 'JPG, PNG এবং WEBP ছবিকে Base64 বা Data URI কোডে রূপান্তর করে কপি করুন, অথবা Base64 স্ট্রিং পেস্ট করে ছবি হিসেবে ডাউনলোড করুন।',
    },
    seoTitle: 'Image to Base64 & Base64 to Image Converter | Fynof',
    seoDescription:
      'Convert JPG, PNG, and WEBP images to Base64 Data URIs or decode Base64 strings back into downloadable image files directly in your browser.',
    seoOverview: [
      {
        en: 'A two-way developer utility for encoding JPG, PNG, and WEBP assets into clean Base64 strings or full HTML/CSS Data URIs with one-click copy. Switch to the Decode tab to paste any Base64 payload—even without a MIME prefix—and inspect or download the image.',
        bn: 'ডেভেলপারদের জন্য দ্রুত Base64 কনভার্টার: JPG, PNG ও WEBP ছবিকে Base64 বা Data URI কোডে রূপান্তর করে কপি করুন, অথবা Base64 স্ট্রিং পেস্ট করে ছবি ডিকোড ও ডাউনলোড করুন।',
      },
      {
        en: 'Built with byte validation and character checks so malformed strings are caught cleanly without freezing your browser tab.',
        bn: 'সঠিক ফরম্যাট ও সাইজ যাচাই সুবিধাসহ তৈরি, ফলে ব্রাউজার হ্যাং না হয়ে দ্রুত ফলাফল পাওয়া যায়।',
      },
    ],
    howToSteps: [
      {
        en: 'Switch between "Image to Base64" and "Base64 to Image" tabs.',
        bn: '"Image to Base64" অথবা "Base64 to Image" ট্যাব নির্বাচন করুন।',
      },
      {
        en: 'Upload an image to copy its Data URI/Base64, or paste a Base64 string to preview the decoded image.',
        bn: 'ছবি আপলোড করে Base64 কপি করুন, অথবা Base64 স্ট্রিং পেস্ট করে ছবির প্রিভিউ দেখুন।',
      },
      {
        en: 'Copy the encoded output or download the decoded JPG, PNG, or WEBP file.',
        bn: 'কোড কপি করুন অথবা ডিকোড করা ছবিটি JPG, PNG বা WEBP হিসেবে ডাউনলোড করুন।',
      },
    ],
    faqs: [
      {
        question: {
          en: 'Does Base64 to Image accept strings without the data:image prefix?',
          bn: 'data:image প্রিফিক্স ছাড়া শুধু Base64 স্ট্রিং দিলে কি কাজ করবে?',
        },
        answer: {
          en: 'Yes. Fynof automatically detects raw Base64 signatures (PNG, JPEG, WEBP, GIF) even without a Data URI prefix.',
          bn: 'হ্যাঁ। প্রিফিক্স ছাড়া শুধু Base64 স্ট্রিং দিলেও Fynof স্বয়ংক্রিয়ভাবে ফরম্যাট চিনে নিয়ে ছবি প্রদর্শন করে।',
        },
      },
    ],
    relatedIds: ['image-converter', 'image-compressor', 'image-resizer'],
  },
];

export const HOMEPAGE_FAQS: ToolFaq[] = [
  {
    question: {
      en: 'Is Fynof really 100% free with no limits?',
      bn: 'Fynof কি সত্যিই সম্পূর্ণ ফ্রি এবং কোনো সীমা নেই?',
    },
    answer: {
      en: 'Yes. All 15 image and PDF tools on Fynof are completely free to use with no daily caps, no watermarks added by us, and no account registration required.',
      bn: 'হ্যাঁ। Fynof-এর সব ১৫টি ইমেজ ও পিডিএফ টুল সম্পূর্ণ ফ্রি। কোনো দৈনিক সীমা, অতিরিক্ত ওয়াটারমার্ক বা অ্যাকাউন্ট খোলার প্রয়োজন নেই।',
    },
  },
  {
    question: {
      en: 'Are my photos uploaded to any server?',
      bn: 'আমার ছবি কি কোনো সার্ভারে আপলোড হয়?',
    },
    answer: {
      en: 'Never. Every tool runs locally inside your web browser using HTML Canvas and client-side JavaScript. Your images never leave your phone or computer.',
      bn: 'কখনই না। প্রতিটি টুল সম্পূর্ণভাবে আপনার ব্রাউজারের ভেতরে HTML Canvas ও JavaScript দিয়ে কাজ করে। কোনো ছবি আপনার ডিভাইসের বাইরে যায় না।',
    },
  },
  {
    question: {
      en: 'Can I reuse an image across different Fynof tools?',
      bn: 'একটি টুলে আপলোড করা ছবি কি অন্য টুলে ব্যবহার করা যায়?',
    },
    answer: {
      en: 'Yes. Once you load an image in any tool, Fynof keeps it ready in your local browser session so you can jump to another tool without re-uploading.',
      bn: 'হ্যাঁ। একবার ছবি লোড করলে সেটি আপনার ব্রাউজার সেশনে প্রস্তুত থাকে, ফলে পুনরায় আপলোড না করেই অন্য টুলে কাজ করতে পারবেন।',
    },
  },
  {
    question: {
      en: 'Does Fynof work smoothly on Android and iPhone browsers?',
      bn: 'Fynof কি অ্যান্ড্রয়েড ও আইফোনের ব্রাউজারে ভালোভাবে কাজ করে?',
    },
    answer: {
      en: 'Yes. The entire workspace, including touch cropping, blur brushing, and downloads, is optimized for mobile screens and memory efficiency.',
      bn: 'হ্যাঁ। টাচ ক্রপিং, ব্লার ব্রাশ ও ডাউনলোডসহ পুরো ওয়েবসাইটটি মোবাইল স্ক্রিন ও পারফরম্যান্সের জন্য অপ্টিমাইজ করা।',
    },
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.id === id);
}
