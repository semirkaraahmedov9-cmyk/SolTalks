import { describe, expect, it } from 'vitest';
import { DEFAULT_DISPLAY_SETTINGS, parseDisplaySettings } from './displaySettings';

describe('parseDisplaySettings', () => {
  it('returns defaults when nothing is stored', () => {
    expect(parseDisplaySettings(null)).toEqual(DEFAULT_DISPLAY_SETTINGS);
  });

  it('reads valid stored settings', () => {
    const raw = JSON.stringify({ largerText: true, highContrast: false });
    expect(parseDisplaySettings(raw)).toEqual({ largerText: true, highContrast: false });
  });

  it('falls back to defaults for broken JSON', () => {
    expect(parseDisplaySettings('{not json')).toEqual(DEFAULT_DISPLAY_SETTINGS);
  });

  it('ignores values that are not real booleans', () => {
    const raw = JSON.stringify({ largerText: 'yes', highContrast: 1 });
    expect(parseDisplaySettings(raw)).toEqual(DEFAULT_DISPLAY_SETTINGS);
  });
});
