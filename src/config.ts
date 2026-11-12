// Central place for values that are expected to change without code changes.

/**
 * Where the audiobook library's audio files are stored.
 * Library audio URL = LIBRARY_BASE_URL + chapter file name.
 * PLACEHOLDER: the storage (e.g. Hugging Face dataset or Internet Archive)
 * is decided in Phase 5; switching storage must only mean editing this value.
 */
export const LIBRARY_BASE_URL = 'https://example.invalid/soltalks-library/';
