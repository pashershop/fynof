import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { Language, WorkspaceImage } from '../types/tool';
import { loadImageFromBlob, validateImageFile } from '../utils/canvasUtils';

interface AppContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (typeof TRANSLATIONS)['en'];
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  sharedImage: WorkspaceImage | null;
  loadSharedFile: (file: Blob, fileName?: string) => Promise<WorkspaceImage>;
  clearSharedImage: () => void;
  recentToolIds: string[];
  recordToolVisit: (toolId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('fynof_lang');
      return saved === 'bn' ? 'bn' : 'en';
    } catch {
      return 'en';
    }
  });

  const [recentToolIds, setRecentToolIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('fynof_recent_tools');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
    } catch {
      return [];
    }
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [sharedImage, setSharedImage] = useState<WorkspaceImage | null>(null);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem('fynof_lang', next);
    } catch {
      // ignore storage failure
    }
    document.documentElement.lang = next;
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'bn' : 'en');
  }, [lang, setLang]);

  const recordToolVisit = useCallback((toolId: string) => {
    setRecentToolIds((prev) => {
      const next = [toolId, ...prev.filter((id) => id !== toolId)].slice(0, 4);
      try {
        localStorage.setItem('fynof_recent_tools', JSON.stringify(next));
      } catch {
        // ignore storage error
      }
      return next;
    });
  }, []);

  const loadSharedFile = useCallback(
    async (file: Blob, fileName?: string): Promise<WorkspaceImage> => {
      if (file instanceof File) {
        const err = validateImageFile(file);
        if (err) throw new Error(err);
      } else if (!file.type.startsWith('image/')) {
        throw new Error('Please choose a valid JPG, PNG, or WEBP image file.');
      }

      const { width, height } = await loadImageFromBlob(file);
      const objectUrl = URL.createObjectURL(file);
      const entry: WorkspaceImage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fileName: fileName || (file instanceof File ? file.name : 'image.png'),
        mimeType: file.type || 'image/png',
        size: file.size,
        width,
        height,
        objectUrl,
        blob: file,
      };
      setSharedImage((prev) => {
        if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
        return entry;
      });
      return entry;
    },
    []
  );

  const clearSharedImage = useCallback(() => {
    setSharedImage((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (sharedImage?.objectUrl) {
        URL.revokeObjectURL(sharedImage.objectUrl);
      }
    };
  }, [sharedImage]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t: TRANSLATIONS[lang],
        searchOpen,
        setSearchOpen,
        sharedImage,
        loadSharedFile,
        clearSharedImage,
        recentToolIds,
        recordToolVisit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
