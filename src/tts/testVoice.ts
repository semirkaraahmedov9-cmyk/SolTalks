// Phase 1 only: the one voice we test. Phase 2 replaces this with public/voices.json.

// Pinned to a commit, so the files never change under us.
const BASE =
  'https://huggingface.co/rhasspy/piper-voices/resolve/ae9d8352b73c1b1750748843e753a504b00e05b0/bg/bg_BG/dimitar/medium/';

export const TEST_VOICE = {
  id: 'bg_BG-dimitar-medium',
  modelUrl: BASE + 'bg_BG-dimitar-medium.onnx',
  configUrl: BASE + 'bg_BG-dimitar-medium.onnx.json',
  /** From the voice list on Hugging Face; used when the server sends no size. */
  modelBytes: 63_221_984,
};
