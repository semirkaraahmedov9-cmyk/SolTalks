// Display preferences (larger text, high contrast), remembered in this
// browser only. Nothing is sent anywhere.

export interface DisplaySettings {
  largerText: boolean;
  highContrast: boolean;
}

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  largerText: false,
  highContrast: false,
};

const STORAGE_KEY = 'soltalks.display';

/** Turns whatever is stored into valid settings; bad data falls back to defaults. */
export function parseDisplaySettings(raw: string | null): DisplaySettings {
  if (!raw) return { ...DEFAULT_DISPLAY_SETTINGS };
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return { ...DEFAULT_DISPLAY_SETTINGS };
    const obj = data as Record<string, unknown>;
    return {
      largerText: obj.largerText === true,
      highContrast: obj.highContrast === true,
    };
  } catch {
    return { ...DEFAULT_DISPLAY_SETTINGS };
  }
}

// Storage can be missing or throw (private mode, blocked site data), so
// every access is guarded and the site still works without it.
export function loadDisplaySettings(): DisplaySettings {
  try {
    return parseDisplaySettings(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return { ...DEFAULT_DISPLAY_SETTINGS };
  }
}

export function saveDisplaySettings(settings: DisplaySettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Not saved; the setting still applies for this visit.
  }
}

/** CSS reacts to these attributes on <html> (see styles/tokens.css). */
export function applyDisplaySettings(
  settings: DisplaySettings,
  root: HTMLElement = document.documentElement,
): void {
  root.dataset.textSize = settings.largerText ? 'large' : 'normal';
  root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
}
