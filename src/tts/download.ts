// Downloads with progress, keeping a copy in the browser's Cache API so a
// large voice file is only downloaded once per device.

/** Shared with engine.ts, which deletes this cache on request. */
export const VOICE_CACHE_NAME = 'soltalks-voices-v1';

export interface DownloadProgress {
  loaded: number;
  total: number;
}

export interface DownloadResult {
  data: ArrayBuffer;
  fromCache: boolean;
}

export class NetworkError extends Error {}

export async function downloadWithCache(
  url: string,
  expectedBytes: number,
  onProgress?: (p: DownloadProgress) => void,
): Promise<DownloadResult> {
  const cache = await openCache();
  const cached = await cache?.match(url);
  if (cached) {
    return { data: await cached.arrayBuffer(), fromCache: true };
  }

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new NetworkError(error instanceof Error ? error.message : String(error));
  }
  if (!response.ok || !response.body) {
    throw new NetworkError(`HTTP ${response.status} for ${url}`);
  }

  const total = Number(response.headers.get('content-length')) || expectedBytes;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      onProgress?.({ loaded, total: Math.max(total, loaded) });
    }
  } catch (error) {
    throw new NetworkError(error instanceof Error ? error.message : String(error));
  }

  const data = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.length;
  }

  try {
    await cache?.put(url, new Response(data.slice()));
  } catch {
    // Storage full or blocked: the voice still works, it just downloads again next time.
  }
  return { data: data.buffer, fromCache: false };
}

// The Cache API is missing on plain http:// pages (except localhost).
export async function openCache(): Promise<Cache | undefined> {
  try {
    return 'caches' in globalThis ? await caches.open(VOICE_CACHE_NAME) : undefined;
  } catch {
    return undefined;
  }
}
