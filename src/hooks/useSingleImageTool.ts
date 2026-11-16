import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkspaceImage } from '../types/tool';
import { validateImageFile } from '../utils/canvasUtils';

export function useToolHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [index, setIndex] = useState(0);

  const current = history[index];
  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  const pushState = useCallback(
    (next: T | ((prev: T) => T)) => {
      setHistory((prevHistory) => {
        const prevVal = prevHistory[index];
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prevVal) : next;
        const sliced = prevHistory.slice(0, index + 1);
        const updated = [...sliced, resolved].slice(-30);
        setIndex(updated.length - 1);
        return updated;
      });
    },
    [index]
  );

  const undo = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const redo = useCallback(() => {
    setIndex((i) => Math.min(history.length - 1, i + 1));
  }, [history.length]);

  const resetHistory = useCallback((resetVal: T) => {
    setHistory([resetVal]);
    setIndex(0);
  }, []);

  return { current, pushState, undo, redo, resetHistory, canUndo, canRedo };
}

export function useEditedObjectUrl() {
  const [editedUrl, setEditedUrl] = useState<string | null>(null);
  const [editedBlob, setEditedBlob] = useState<Blob | null>(null);
  const urlRef = useRef<string | null>(null);

  const setOutput = useCallback((blob: Blob | null) => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    if (blob) {
      const nextUrl = URL.createObjectURL(blob);
      urlRef.current = nextUrl;
      setEditedUrl(nextUrl);
      setEditedBlob(blob);
    } else {
      setEditedUrl(null);
      setEditedBlob(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, []);

  return { editedUrl, editedBlob, setOutput };
}

export function useActiveToolImage() {
  const { sharedImage, loadSharedFile } = useApp();
  const [localImage, setLocalImage] = useState<WorkspaceImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (files: File[]) => {
      setError(null);
      const file = files[0];
      if (!file) {
        setError('No image selected.');
        return;
      }
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      try {
        const loaded = await loadSharedFile(file, file.name);
        setLocalImage(loaded);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to decode image. The file may be corrupted.'
        );
      }
    },
    [loadSharedFile]
  );

  const useWorkspaceImage = useCallback(() => {
    if (sharedImage) {
      setError(null);
      setLocalImage(sharedImage);
    }
  }, [sharedImage]);

  const clearImage = useCallback(() => {
    setLocalImage(null);
    setError(null);
  }, []);

  return {
    image: localImage,
    error,
    setError,
    handleUpload,
    useWorkspaceImage,
    clearImage,
  };
}
