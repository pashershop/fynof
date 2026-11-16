import React, { Suspense, lazy } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ToolPageShell } from '../components/ToolPageShell';
import { useApp } from '../context/AppContext';
import { getToolBySlug } from '../data/tools';

const TOOL_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'image-compressor': lazy(() =>
    import('../tools/ImageCompressorTool').then((m) => ({ default: m.ImageCompressorTool }))
  ),
  'image-resizer': lazy(() =>
    import('../tools/ImageResizerTool').then((m) => ({ default: m.ImageResizerTool }))
  ),
  'image-converter': lazy(() =>
    import('../tools/ImageConverterTool').then((m) => ({ default: m.ImageConverterTool }))
  ),
  'image-cropper': lazy(() =>
    import('../tools/ImageCropperTool').then((m) => ({ default: m.ImageCropperTool }))
  ),
  'passport-photo-maker': lazy(() =>
    import('../tools/PassportPhotoTool').then((m) => ({ default: m.PassportPhotoTool }))
  ),
  'image-to-pdf': lazy(() =>
    import('../tools/ImageToPdfTool').then((m) => ({ default: m.ImageToPdfTool }))
  ),
  'pdf-to-image': lazy(() =>
    import('../tools/PdfToImageTool').then((m) => ({ default: m.PdfToImageTool }))
  ),
  'signature-resizer': lazy(() =>
    import('../tools/SignatureResizerTool').then((m) => ({ default: m.SignatureResizerTool }))
  ),
  'nid-job-photo-resizer': lazy(() =>
    import('../tools/NidPhotoResizerTool').then((m) => ({ default: m.NidPhotoResizerTool }))
  ),
  'photo-collage-maker': lazy(() =>
    import('../tools/PhotoCollageTool').then((m) => ({ default: m.PhotoCollageTool }))
  ),
  'image-rotator-flipper': lazy(() =>
    import('../tools/ImageRotatorTool').then((m) => ({ default: m.ImageRotatorTool }))
  ),
  'image-watermark': lazy(() =>
    import('../tools/ImageWatermarkTool').then((m) => ({ default: m.ImageWatermarkTool }))
  ),
  'image-blur-tool': lazy(() =>
    import('../tools/ImageBlurTool').then((m) => ({ default: m.ImageBlurTool }))
  ),
  'image-filters': lazy(() =>
    import('../tools/ImageFiltersTool').then((m) => ({ default: m.ImageFiltersTool }))
  ),
  'image-to-base64': lazy(() =>
    import('../tools/Base64Tool').then((m) => ({ default: m.Base64Tool }))
  ),
};

export const ToolRoutePage: React.FC = () => {
  const { lang } = useApp();
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? getToolBySlug(slug) : undefined;
  const Component = slug ? TOOL_COMPONENTS[slug] : undefined;

  if (!tool || !Component) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {lang === 'en' ? 'Page Not Found' : 'পৃষ্ঠা পাওয়া যায়নি'}
        </h1>
        <p className="text-sm text-slate-600">
          {lang === 'en'
            ? 'The requested tool or page could not be found.'
            : 'অনুরোধ করা টুল বা পৃষ্ঠাটি পাওয়া যায়নি।'}
        </p>
        <Link
          to="/all-tools"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 min-h-[44px]"
        >
          {lang === 'en' ? 'Browse All 15 Tools' : 'সকল ১৫টি টুল দেখুন'}
        </Link>
      </div>
    );
  }

  return (
    <ToolPageShell tool={tool}>
      <Suspense
        fallback={
          <div className="p-10 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm text-slate-600">
            {lang === 'en' ? 'Loading editor workspace...' : 'এডিটর লোড হচ্ছে...'}
          </div>
        }
      >
        <Component />
      </Suspense>
    </ToolPageShell>
  );
};
