// Temporary Phase 1 page: proves the Bulgarian voice works and measures speed.
import { useEffect, useMemo, useState } from 'react';
import { t } from '../i18n';
import { Page } from '../components/Page';
import { SettingSlider } from '../components/test/SettingSlider';
import { TestResults } from '../components/test/TestResults';
import type { SynthesisSettings } from '../tts/piperConfig';
import { useTtsWorker } from '../tts/useTtsWorker';

// Dimitar's defaults from its model card; the sliders start here.
const DEFAULT_SETTINGS: SynthesisSettings = { noiseScale: 0.5, lengthScale: 1, noiseW: 0.333 };

const mb = (bytes: number) => (bytes / 1e6).toLocaleString('bg-BG', { maximumFractionDigits: 1 });

export function TestPage() {
  const [text, setText] = useState<string>(t.test.defaultText);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const { synthesize, progress, result, error, busy } = useTtsWorker();

  const audioUrl = useMemo(
    () => (result ? URL.createObjectURL(new Blob([result.wav], { type: 'audio/wav' })) : null),
    [result],
  );
  useEffect(() => () => void (audioUrl && URL.revokeObjectURL(audioUrl)), [audioUrl]);

  const status = (() => {
    if (error) return t.test.statusError(error);
    if (!busy) return result ? t.test.statusDone : '';
    if (progress?.stage === 'download') {
      const percent = Math.floor((progress.loaded / progress.total) * 100);
      return t.test.statusDownloading(percent, mb(progress.loaded), mb(progress.total));
    }
    if (progress?.stage === 'synthesize') return t.test.statusSynthesizing;
    return t.test.statusLoading;
  })();

  const update = (key: keyof SynthesisSettings) => (value: number) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <Page title={t.test.title}>
      <p>{t.test.intro}</p>
      <p>{t.test.downloadNote}</p>

      <div className="field">
        <label htmlFor="test-text">{t.test.textLabel}</label>
        <textarea id="test-text" rows={5} value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      <fieldset className="field">
        <legend>{t.test.settingsHeading}</legend>
        <SettingSlider id="noise-scale" label={t.test.noiseScale} help={t.test.noiseScaleHelp}
          min={0} max={1} step={0.05} value={settings.noiseScale} onChange={update('noiseScale')} />
        <SettingSlider id="length-scale" label={t.test.lengthScale} help={t.test.lengthScaleHelp}
          min={0.6} max={1.6} step={0.05} value={settings.lengthScale} onChange={update('lengthScale')} />
        <SettingSlider id="noise-w" label={t.test.noiseW} help={t.test.noiseWHelp}
          min={0} max={1} step={0.05} value={settings.noiseW} onChange={update('noiseW')} />
        <button type="button" className="btn btn--secondary" onClick={() => setSettings(DEFAULT_SETTINGS)}>
          {t.test.resetSettings}
        </button>
      </fieldset>

      <p>
        <button
          type="button"
          className="btn btn--primary"
          disabled={busy || !text.trim()}
          onClick={() => synthesize({ type: 'synthesize', text, settings })}
        >
          {busy ? t.test.working : t.test.speak}
        </button>
      </p>

      {/* Screen readers announce progress and results from this region. */}
      <p role="status" className="status">{status}</p>

      {audioUrl && result && (
        <>
          <h2>{t.test.playerLabel}</h2>
          <audio controls src={audioUrl} className="test-audio" />
          <p>
            <a href={audioUrl} download="soltalks-test.wav">{t.test.downloadWav}</a>
          </p>
          <TestResults result={result} />
        </>
      )}
    </Page>
  );
}
