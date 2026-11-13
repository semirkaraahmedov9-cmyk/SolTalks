// Loads the Bulgarian stress data inside the worker. The big list (≈0.6 MB,
// compressed) is fetched once from our own site; the small hand-written fixes
// file is built into the code, so a change to it needs only a new deploy.
import listUrl from '../../pronunciation/bg-stress-list.txt.gz?url';
import fixesText from '../../pronunciation/bg-stress-fixes.txt?raw';
import { parseStressFixes, parseStressList, type StressLexicon } from '../text/stress';

let loading: Promise<StressLexicon> | undefined;

/** Stress data for an eSpeak language, or undefined if we have none for it. */
export async function loadStressLexicon(language: string): Promise<StressLexicon | undefined> {
  if (language !== 'bg') return undefined;
  if (!loading) {
    loading = load();
    loading.catch(() => (loading = undefined)); // allow a retry later
  }
  try {
    return await loading;
  } catch (error) {
    // Speech still works without the list, just with eSpeak's own stress.
    console.warn('Stress list could not be loaded', error);
    return undefined;
  }
}

async function load(): Promise<StressLexicon> {
  const { fixes, problems } = parseStressFixes(fixesText);
  if (problems.length > 0) console.warn('Problems in bg-stress-fixes.txt:', problems);
  return { list: parseStressList(await fetchText(listUrl)), fixes };
}

/** Fetches a gzip file, or plain text if the server already unpacked it. */
async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;
  if (!isGzip) return new TextDecoder().decode(bytes);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}
