import { t } from '../i18n';
import { useDisplaySettings } from '../settings/useDisplaySettings';
import type { DisplaySettings } from '../settings/displaySettings';

const TOGGLES: { key: keyof DisplaySettings; label: string }[] = [
  { key: 'largerText', label: t.display.largerText },
  { key: 'highContrast', label: t.display.highContrast },
];

/**
 * Toggle buttons shown on every page. aria-pressed tells screen readers the
 * on/off state; the check box makes it visible without relying on colour.
 */
export function DisplayToggles() {
  const { settings, toggle } = useDisplaySettings();

  return (
    <div className="display-toggles">
      <div className="container display-toggles__inner" role="group" aria-label={t.a11y.displaySettingsLabel}>
        {TOGGLES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className="toggle"
            aria-pressed={settings[key]}
            onClick={() => toggle(key)}
          >
            <span className="toggle__box" aria-hidden="true">
              {settings[key] ? '✓' : ''}
            </span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
