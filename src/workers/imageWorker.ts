// Web Worker for CPU-intensive pixel manipulation so the main UI thread stays responsive on mobile devices.

export type WorkerMessage =
  | {
      id: number;
      type: 'sharpen';
      buffer: ArrayBuffer;
      width: number;
      height: number;
      amount: number;
    }
  | {
      id: number;
      type: 'quantize';
      buffer: ArrayBuffer;
      width: number;
      height: number;
      levels: number;
    };

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;
  try {
    if (msg.type === 'sharpen') {
      const s = new Uint8ClampedArray(msg.buffer);
      const d = new Uint8ClampedArray(s.length);
      const { width, height, amount } = msg;
      const strength = Math.min(1, amount / 100) * 1.5;
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
            d[idx + c] = val < 0 ? 0 : val > 255 ? 255 : val;
          }
          d[idx + 3] = s[idx + 3];
        }
      }

      (self as unknown as Worker).postMessage(
        { id: msg.id, ok: true, buffer: d.buffer },
        [d.buffer]
      );
      return;
    }

    if (msg.type === 'quantize') {
      const data = new Uint8ClampedArray(msg.buffer);
      const step = 255 / Math.max(1, msg.levels - 1);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.round(Math.round(data[i] / step) * step);
        data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
        data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
      }
      (self as unknown as Worker).postMessage(
        { id: msg.id, ok: true, buffer: data.buffer },
        [data.buffer]
      );
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({
      id: msg.id,
      ok: false,
      error: err instanceof Error ? err.message : 'Worker processing failed',
    });
  }
};
