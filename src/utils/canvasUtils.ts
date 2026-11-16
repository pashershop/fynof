/**
 * Client-side HTML Canvas + Web Worker image processing utilities for Fynof.
 * All operations execute strictly in browser memory with clean Object URL management.
 */

export const MAX_SAFE_CANVAS_DIM = 4096;
export const RECOMMENDED_MAX_IMAGE_BYTES = 25 * 1024 * 1024; // 25 MB recommended
export const HARD_MAX_IMAGE_BYTES = 60 * 1024 * 1024; // 60 MB safety limit
export const HARD_MAX_PDF_BYTES = 100 * 1024 * 1024; // 100 MB PDF limit

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

export function validateImageFile(file: File): string | null {
  const lower = file.name.toLowerCase();
  const hasValidExt = /\.(jpe?g|png|webp)$/.test(lower);
  const hasValidMime = ALLOWED_IMAGE_MIMES.has(file.type) || file.type.startsWith('image/');
  if (!hasValidMime && !hasValidExt) {
    return 'Unsupported file type. Please upload a JPG, JPEG, PNG, or WEBP image.';
  }
  if (file.size === 0) {
    return 'The selected file is empty (0 bytes).';
  }
  if (file.size > HARD_MAX_IMAGE_BYTES) {
    return `File is too large (${formatBytes(file.size)}). Maximum supported size is 60 MB.`;
  }
  return null;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb >= 100 ? 0 : 1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        reject(new Error('Corrupted or unreadable image dimensions.'));
        return;
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error('Corrupted or unsupported image file.'));
    img.src = url;
  });
}

export async function loadImageFromBlob(blob: Blob): Promise<{
  img: HTMLImageElement;
  width: number;
  height: number;
}> {
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImageFromUrl(url);
    return {
      img,
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function detectImageTransparency(img: HTMLImageElement): boolean {
  const sampleW = Math.min(256, img.naturalWidth);
  const sampleH = Math.min(256, img.naturalHeight);
  const c = document.createElement('canvas');
  c.width = sampleW;
  c.height = sampleH;
  const ctx = c.getContext('2d');
  if (!ctx) return false;
  ctx.drawImage(img, 0, 0, sampleW, sampleH);
  const data = ctx.getImageData(0, 0, sampleW, sampleH).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) return true;
  }
  return false;
}

export function createCanvasFromImage(
  img: HTMLImageElement,
  targetWidth?: number,
  targetHeight?: number,
  backgroundColor?: string
): HTMLCanvasElement {
  let w = targetWidth ?? img.naturalWidth;
  let h = targetHeight ?? img.naturalHeight;

  // Guard mobile browser canvas memory limits
  if (w > MAX_SAFE_CANVAS_DIM || h > MAX_SAFE_CANVAS_DIM) {
    const scale = Math.min(MAX_SAFE_CANVAS_DIM / w, MAX_SAFE_CANVAS_DIM / h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Browser canvas memory error. Try a smaller image.');
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Multi-step high-quality resize to avoid aliasing when downscaling sharply.
 */
export function resizeCanvasHighQuality(
  source: HTMLCanvasElement | HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  backgroundColor?: string
): HTMLCanvasElement {
  const srcW = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const srcH = source instanceof HTMLImageElement ? source.naturalHeight : source.height;

  const finalW = Math.max(1, Math.min(MAX_SAFE_CANVAS_DIM, Math.round(targetWidth)));
  const finalH = Math.max(1, Math.min(MAX_SAFE_CANVAS_DIM, Math.round(targetHeight)));

  let currentCanvas = document.createElement('canvas');
  currentCanvas.width = srcW;
  currentCanvas.height = srcH;
  const initCtx = currentCanvas.getContext('2d');
  if (!initCtx) throw new Error('Browser memory limit exceeded while resizing.');
  initCtx.drawImage(source, 0, 0);

  let curW = srcW;
  let curH = srcH;

  while (curW * 0.5 > finalW && curH * 0.5 > finalH) {
    const nextW = Math.max(finalW, Math.floor(curW * 0.5));
    const nextH = Math.max(finalH, Math.floor(curH * 0.5));
    const stepCanvas = document.createElement('canvas');
    stepCanvas.width = nextW;
    stepCanvas.height = nextH;
    const stepCtx = stepCanvas.getContext('2d')!;
    stepCtx.imageSmoothingEnabled = true;
    stepCtx.imageSmoothingQuality = 'high';
    stepCtx.drawImage(currentCanvas, 0, 0, curW, curH, 0, 0, nextW, nextH);
    currentCanvas = stepCanvas;
    curW = nextW;
    curH = nextH;
  }

  const out = document.createElement('canvas');
  out.width = finalW;
  out.height = finalH;
  const outCtx = out.getContext('2d')!;
  if (backgroundColor) {
    outCtx.fillStyle = backgroundColor;
    outCtx.fillRect(0, 0, finalW, finalH);
  }
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(currentCanvas, 0, 0, curW, curH, 0, 0, finalW, finalH);
  return out;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to encode output image.'));
        },
        mimeType,
        quality
      );
    } catch {
      reject(new Error('Browser memory limit reached while encoding image.'));
    }
  });
}

// Singleton Web Worker runner for heavy pixel operations
let sharedWorker: Worker | null = null;
let workerJobSeq = 0;

function getWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null;
  if (!sharedWorker) {
    try {
      sharedWorker = new Worker(
        new URL('../workers/imageWorker.ts', import.meta.url),
        { type: 'module' }
      );
    } catch {
      return null;
    }
  }
  return sharedWorker;
}

function runPixelWorker(
  type: 'sharpen' | 'quantize',
  imgData: ImageData,
  extra: { amount?: number; levels?: number }
): Promise<ImageData | null> {
  const worker = getWorker();
  if (!worker) return Promise.resolve(null);

  return new Promise((resolve) => {
    const id = ++workerJobSeq;
    const copy = new Uint8ClampedArray(imgData.data);
    const timeout = setTimeout(() => {
      worker.removeEventListener('message', onMsg);
      resolve(null);
    }, 8000);

    const onMsg = (e: MessageEvent<{ id: number; ok: boolean; buffer?: ArrayBuffer }>) => {
      if (e.data.id !== id) return;
      clearTimeout(timeout);
      worker.removeEventListener('message', onMsg);
      if (e.data.ok && e.data.buffer) {
        const out = new ImageData(
          new Uint8ClampedArray(e.data.buffer),
          imgData.width,
          imgData.height
        );
        resolve(out);
      } else {
        resolve(null);
      }
    };

    worker.addEventListener('message', onMsg);
    worker.postMessage(
      {
        id,
        type,
        buffer: copy.buffer,
        width: imgData.width,
        height: imgData.height,
        amount: extra.amount ?? 0,
        levels: extra.levels ?? 32,
      },
      [copy.buffer]
    );
  });
}

/**
 * Compresses canvas to fit under targetBytes.
 * For lossy formats (JPEG/WEBP), binary-searches quality and scales down only if needed.
 * For PNG, quantizes color levels inside Web Worker and scales down if needed while preserving transparency.
 */
export async function compressToTargetSize(
  sourceCanvas: HTMLCanvasElement,
  mimeType: string,
  targetBytes: number,
  options?: { allowScaleDown?: boolean; backgroundColor?: string }
): Promise<{ blob: Blob; qualityUsed: number; width: number; height: number }> {
  const allowScaleDown = options?.allowScaleDown ?? true;
  const bg = options?.backgroundColor;

  let working = sourceCanvas;
  if (mimeType === 'image/jpeg' && bg) {
    working = resizeCanvasHighQuality(sourceCanvas, sourceCanvas.width, sourceCanvas.height, bg);
  }

  if (mimeType === 'image/png') {
    let blob = await canvasToBlob(working, 'image/png');
    if (blob.size <= targetBytes) {
      return { blob, qualityUsed: 1, width: working.width, height: working.height };
    }
    const levels = [64, 32, 16, 8];
    for (const lv of levels) {
      const qCanvas = await quantizeCanvasColorsAsync(working, lv);
      blob = await canvasToBlob(qCanvas, 'image/png');
      if (blob.size <= targetBytes) {
        return { blob, qualityUsed: lv / 64, width: qCanvas.width, height: qCanvas.height };
      }
    }
    if (allowScaleDown) {
      let scale = 0.85;
      while (scale >= 0.25) {
        const sw = Math.max(16, Math.round(working.width * scale));
        const sh = Math.max(16, Math.round(working.height * scale));
        const scaled = resizeCanvasHighQuality(working, sw, sh);
        const qScaled = await quantizeCanvasColorsAsync(scaled, 24);
        blob = await canvasToBlob(qScaled, 'image/png');
        if (blob.size <= targetBytes) {
          return { blob, qualityUsed: scale, width: sw, height: sh };
        }
        scale -= 0.12;
      }
    }
    return { blob, qualityUsed: 0.5, width: working.width, height: working.height };
  }

  let low = 0.05;
  let high = 0.98;
  let bestBlob = await canvasToBlob(working, mimeType, 0.85);
  let bestQ = 0.85;

  if (bestBlob.size <= targetBytes) {
    low = 0.85;
  } else {
    high = 0.85;
  }

  for (let i = 0; i < 8; i++) {
    const mid = (low + high) / 2;
    const candidate = await canvasToBlob(working, mimeType, mid);
    if (candidate.size <= targetBytes) {
      bestBlob = candidate;
      bestQ = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  if (bestBlob.size > targetBytes && allowScaleDown) {
    let scale = 0.85;
    while (scale >= 0.2) {
      const sw = Math.max(32, Math.round(working.width * scale));
      const sh = Math.max(32, Math.round(working.height * scale));
      const scaled = resizeCanvasHighQuality(working, sw, sh, bg);
      let sLow = 0.1;
      let sHigh = 0.92;
      let sBest = await canvasToBlob(scaled, mimeType, 0.5);
      let sQ = 0.5;
      for (let j = 0; j < 6; j++) {
        const mid = (sLow + sHigh) / 2;
        const cand = await canvasToBlob(scaled, mimeType, mid);
        if (cand.size <= targetBytes) {
          sBest = cand;
          sQ = mid;
          sLow = mid;
        } else {
          sHigh = mid;
        }
      }
      if (sBest.size <= targetBytes) {
        return { blob: sBest, qualityUsed: sQ, width: sw, height: sh };
      }
      bestBlob = sBest;
      scale -= 0.15;
    }
  }

  return {
    blob: bestBlob,
    qualityUsed: bestQ,
    width: working.width,
    height: working.height,
  };
}

async function quantizeCanvasColorsAsync(
  source: HTMLCanvasElement,
  levels: number
): Promise<HTMLCanvasElement> {
  const out = document.createElement('canvas');
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext('2d')!;
  ctx.drawImage(source, 0, 0);
  const imgData = ctx.getImageData(0, 0, out.width, out.height);

  const workerResult = await runPixelWorker('quantize', imgData, { levels });
  if (workerResult) {
    ctx.putImageData(workerResult, 0, 0);
    return out;
  }

  const data = imgData.data;
  const step = 255 / Math.max(1, levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step);
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
  }
  ctx.putImageData(imgData, 0, 0);
  return out;
}

/**
 * 3x3 Convolution sharpen filter offloaded to Web Worker when supported.
 */
export async function applySharpenConvolutionAsync(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
): Promise<void> {
  if (amount <= 0) return;
  const src = ctx.getImageData(0, 0, width, height);
  const workerRes = await runPixelWorker('sharpen', src, { amount });
  if (workerRes) {
    ctx.putImageData(workerRes, 0, 0);
    return;
  }

  // Fallback on main thread
  const strength = Math.min(1, amount / 100) * 1.5;
  const dst = ctx.createImageData(width, height);
  const s = src.data;
  const d = dst.data;
  const kCenter = 1 + 4 * strength;
  const kSide = -strength;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        d[idx] = s[idx];
        d[idx + 1] = s[idx + 1];
        d[idx + 2] = s[idx + 2];
        d[idx + 3] = s[idx + 3];
        continue;
      }
      const up = ((y - 1) * width + x) * 4;
      const down = ((y + 1) * width + x) * 4;
      const left = (y * width + (x - 1)) * 4;
      const right = (y * width + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val =
          s[idx + c] * kCenter +
          (s[up + c] + s[down + c] + s[left + c] + s[right + c]) * kSide;
        d[idx + c] = Math.max(0, Math.min(255, val));
      }
      d[idx + 3] = s[idx + 3];
    }
  }
  ctx.putImageData(dst, 0, 0);
}

/**
 * Pixelates a rectangular region on a canvas.
 */
export function applyPixelateRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  blockSize: number
): void {
  const rx = Math.max(0, Math.floor(x));
  const ry = Math.max(0, Math.floor(y));
  const rw = Math.min(ctx.canvas.width - rx, Math.ceil(w));
  const rh = Math.min(ctx.canvas.height - ry, Math.ceil(h));
  if (rw <= 0 || rh <= 0) return;

  const size = Math.max(4, Math.round(blockSize));
  const imgData = ctx.getImageData(rx, ry, rw, rh);
  const data = imgData.data;

  for (let py = 0; py < rh; py += size) {
    for (let px = 0; px < rw; px += size) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0,
        count = 0;
      const maxY = Math.min(rh, py + size);
      const maxX = Math.min(rw, px + size);
      for (let sy = py; sy < maxY; sy++) {
        for (let sx = px; sx < maxX; sx++) {
          const i = (sy * rw + sx) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          a += data[i + 3];
          count++;
        }
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      a = Math.round(a / count);

      for (let sy = py; sy < maxY; sy++) {
        for (let sx = px; sx < maxX; sx++) {
          const i = (sy * rw + sx) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = a;
        }
      }
    }
  }
  ctx.putImageData(imgData, rx, ry);
}

/**
 * Flood-fill edge background replacement for Passport Photo Maker.
 */
export function replaceConnectedBackground(
  canvas: HTMLCanvasElement,
  newBgHex: string,
  tolerance = 36
): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0);

  const w = out.width;
  const h = out.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  const cleanHex = newBgHex.replace('#', '');
  const bgR = parseInt(cleanHex.slice(0, 2), 16) || 255;
  const bgG = parseInt(cleanHex.slice(2, 4), 16) || 255;
  const bgB = parseInt(cleanHex.slice(4, 6), 16) || 255;

  const tl = 0;
  const tr = (w - 1) * 4;
  const refR = Math.round((d[tl] + d[tr]) / 2);
  const refG = Math.round((d[tl + 1] + d[tr + 1]) / 2);
  const refB = Math.round((d[tl + 2] + d[tr + 2]) / 2);

  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const tolSq = tolerance * tolerance * 3;
  const push = (x: number, y: number) => {
    const p = y * w + x;
    if (visited[p]) return;
    visited[p] = 1;
    queue[tail++] = p;
  };

  for (let x = 0; x < w; x++) push(x, 0);
  for (let y = 0; y < Math.floor(h * 0.85); y++) {
    push(0, y);
    push(w - 1, y);
  }

  while (head < tail) {
    const p = queue[head++];
    const i = p * 4;
    const dr = d[i] - refR;
    const dg = d[i + 1] - refG;
    const db = d[i + 2] - refB;
    const distSq = dr * dr + dg * dg + db * db;

    if (distSq <= tolSq || d[i + 3] < 20) {
      d[i] = bgR;
      d[i + 1] = bgG;
      d[i + 2] = bgB;
      d[i + 3] = 255;

      const x = p % w;
      const y = (p - x) / w;
      if (x > 0) push(x - 1, y);
      if (x < w - 1) push(x + 1, y);
      if (y > 0) push(x, y - 1);
      if (y < h - 1) push(x, y + 1);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return out;
}

export function downloadBlob(blob: Blob, filename: string): boolean {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return true;
  } catch {
    return false;
  }
}

export function getExtensionForMime(mimeType: string): string {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return 'jpg';
}

export function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '') || 'image';
}
