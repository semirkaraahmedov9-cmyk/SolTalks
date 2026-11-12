import { useEffect, useState } from 'react';
import {
  applyDisplaySettings,
  loadDisplaySettings,
  saveDisplaySettings,
  type DisplaySettings,
} from './displaySettings';

/** React state for the display toggles; applies and remembers every change. */
export function useDisplaySettings() {
  const [settings, setSettings] = useState<DisplaySettings>(loadDisplaySettings);

  useEffect(() => {
    applyDisplaySettings(settings);
    saveDisplaySettings(settings);
  }, [settings]);

  const toggle = (key: keyof DisplaySettings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return { settings, toggle };
}
