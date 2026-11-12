// The list of available voices lives in public/voices.json, so a new voice
// (e.g. a volunteer's) is added with one entry and no code changes.
import { publicUrl } from '../utils/publicUrl';

export interface VoiceInfo {
  id: string;
  /** Name shown to users, in Bulgarian. */
  name: string;
  gender: 'male' | 'female';
  language: string;
  modelUrl: string;
  configUrl: string;
  sizeMb: number;
  license: string;
  credit: string;
}

let voicesPromise: Promise<VoiceInfo[]> | undefined;

export function getVoices(): Promise<VoiceInfo[]> {
  voicesPromise ??= fetch(publicUrl('voices.json')).then((response) => {
    if (!response.ok) throw new Error(`voices.json: HTTP ${response.status}`);
    return response.json() as Promise<VoiceInfo[]>;
  });
  voicesPromise.catch(() => (voicesPromise = undefined)); // allow a retry later
  return voicesPromise;
}

export async function getVoice(id: string): Promise<VoiceInfo> {
  const voice = (await getVoices()).find((v) => v.id === id);
  if (!voice) throw new Error(`Unknown voice: ${id}`);
  return voice;
}
