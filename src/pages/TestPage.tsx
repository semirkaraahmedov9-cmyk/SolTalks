// Temporary test page for the speech engine (Phases 1–2). The real
// "Преобразувай" page replaces it in Phase 3.
import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from '../i18n';
import { Page } from '../components/Page';
import { SettingSlider } from '../components/test/SettingSlider';
import { TestResults } from '../components/test/TestResults';
import { EngineProgress, type ProgressState } from '../components/test/EngineProgress';
import { normalizeText } from '../text/normalize';
import {
  deleteDownloadedVoices,
  EngineError,
  isVoiceDownloaded,
  previewSpokenText,
  synthesize,
  type AudioFormat,
  type SynthesisOutput,
} from '../tts/engine';
import { DEFAULT_COMMA_PAUSE_MS } from '../tts/pauses';
import type { SynthesisSettings } from '../tts/piperConfig';
import { getVoices, type VoiceInfo } from '../tts/voices';

// Dimitar's defaults from its model card, plus our pronunciation helpers.
const DEFAULT_SETTINGS: SynthesisSettings = {
  noiseScale: 0.5,
  lengthScale: 1,
  noiseW: 0.333,
  commaPauseMs: DEFAULT_COMMA_PAUSE_MS,
  fixStress: true,
};
const LONG_TEXT = Array.from({ length: 6 }, () => t.test.sampleParagraphs.join('\n\n')).join('\n\n');

export interface TestRun extends SynthesisOutput {
  totalMs: number;
  format: AudioFormat;
}

function errorMessage(error: unknown): string {
  if (error instanceof EngineError) {
    if (error.code === 'network') return t.engine.errorNetwork;
    if (error.code === 'empty-text') return t.engine.errorEmpty;
  }
  return t.engine.errorUnknown;
}

export function TestPage() {
  const [voice, setVoice] = useState<VoiceInfo | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [text, setText] = useState<string>(t.test.defaultText);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [format, setFormat] = useState<AudioFormat>('mp3');
  const [progress, setProgress] = useState<ProgressState>({ stage: 'idle' });
  const [run, setRun] = useState<TestRun | null>(null);
  const [spokenText, setSpokenText] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    getVoices()
      .then(async ([first]) => {
        setVoice(first);
        setDownloaded(await isVoiceDownloaded(first.id));
      })
      .catch(() => setProgress({ stage: 'message', text: t.engine.errorNetwork }));
  }, []);

  // Show the text with stress marks; wait for a pause in typing first.
  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      previewSpokenText(text)
        .then((spoken) => current && setSpokenText(spoken))
        .catch(() => current && setSpokenText(normalizeText(text)));
    }, 400);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [text]);

  const audioUrl = useMemo(
    () => (run ? URL.createObjectURL(new Blob([run.audio], { type: run.mimeType })) : null),
    [run],
  );
  useEffect(() => () => void (audioUrl && URL.revokeObjectURL(audioUrl)), [audioUrl]);

  const busy = progress.stage === 'downloading' || progress.stage === 'generating';

  async function speak() {
    if (!voice) return;
    const controller = new AbortController();
    abortRef.current = controller;
    const start = performance.now();
    setRun(null);
    setProgress({ stage: 'generating', fraction: 0 });
    try {
      const output = await synthesize(text, {
        voiceId: voice.id,
        format,
        settings,
        signal: controller.signal,
        onDownloadProgress: ({ loaded, total }) => setProgress({ stage: 'downloading', fraction: loaded / total }),
        onProgress: (fraction) => setProgress({ stage: 'generating', fraction }),
      });
      setRun({ ...output, totalMs: performance.now() - start, format });
      setProgress({ stage: 'message', text: t.engine.done });
      setDownloaded(true);
    } catch (error) {
      const cancelled = error instanceof DOMException && error.name === 'AbortError';
      setProgress({ stage: 'message', text: cancelled ? t.engine.cancelled : errorMessage(error) });
    }
  }

  async function deleteVoices() {
    await deleteDownloadedVoices();
    setDownloaded(false);
    setProgress({ stage: 'message', text: t.engine.voicesDeleted });
  }

  const update = (key: 'noiseScale' | 'lengthScale' | 'noiseW' | 'commaPauseMs') => (value: number) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <Page title={t.test.title}>
      <p>{t.test.intro}</p>
      {voice && (
        <p>
          {downloaded
            ? t.engine.voiceDownloaded(voice.name)
            : t.engine.voiceNotDownloaded(voice.name, voice.sizeMb.toLocaleString('bg-BG'))}
        </p>
      )}

      <div className="field">
        <label htmlFor="test-text">{t.test.textLabel}</label>
        <textarea id="test-text" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <p>
        <button type="button" className="btn btn--secondary" onClick={() => setText(LONG_TEXT)} disabled={busy}>
          {t.test.longText}
        </button>
      </p>
      <details className="field">
        <summary>{t.test.normalizedHeading}</summary>
        <p>{t.test.normalizedHelp}</p>
        <p className="normalized">{spokenText}</p>
      </details>

      <fieldset className="field">
        <legend>{t.test.settingsHeading}</legend>
        <SettingSlider id="noise-scale" label={t.test.noiseScale} help={t.test.noiseScaleHelp}
          min={0} max={1} step={0.05} value={settings.noiseScale} onChange={update('noiseScale')} />
        <SettingSlider id="length-scale" label={t.test.lengthScale} help={t.test.lengthScaleHelp}
          min={0.6} max={1.6} step={0.05} value={settings.lengthScale} onChange={update('lengthScale')} />
        <SettingSlider id="noise-w" label={t.test.noiseW} help={t.test.noiseWHelp}
          min={0} max={1} step={0.05} value={settings.noiseW} onChange={update('noiseW')} />
        <SettingSlider id="comma-pause" label={t.test.commaPause} help={t.test.commaPauseHelp}
          min={0} max={600} step={25} value={settings.commaPauseMs} onChange={update('commaPauseMs')} />
        <label className="choice">
          <input
            type="checkbox"
            checked={settings.fixStress}
            onChange={(e) => setSettings((prev) => ({ ...prev, fixStress: e.target.checked }))}
          />
          {t.test.fixStress}
        </label>
        <button type="button" className="btn btn--secondary" onClick={() => setSettings(DEFAULT_SETTINGS)}>
          {t.test.resetSettings}
        </button>
      </fieldset>

      <fieldset className="field">
        <legend>{t.test.formatLabel}</legend>
        {(['mp3', 'wav'] as const).map((value) => (
          <label key={value} className="choice">
            <input
              type="radio"
              name="format"
              value={value}
              checked={format === value}
              onChange={() => setFormat(value)}
            />
            {value === 'mp3' ? t.test.formatMp3 : t.test.formatWav}
          </label>
        ))}
      </fieldset>

      <div className="button-row">
        <button type="button" className="btn btn--primary" disabled={busy || !voice || !text.trim()} onClick={speak}>
          {t.test.speak}
        </button>
        {busy && (
          <button type="button" className="btn btn--secondary" onClick={() => abortRef.current?.abort()}>
            {t.test.stop}
          </button>
        )}
      </div>

      <EngineProgress state={progress} />
      {busy && <p className="notice">{t.engine.keepPageOpen}</p>}

      {audioUrl && run && (
        <>
          <h2>{t.test.playerLabel}</h2>
          <audio controls src={audioUrl} className="test-audio" />
          <p>
            <a href={audioUrl} download={`soltalks-test.${run.format}`}>
              {t.test.downloadFile(run.format.toUpperCase())}
            </a>
          </p>
          <TestResults run={run} />
        </>
      )}

      <p>
        <button type="button" className="btn btn--secondary" onClick={deleteVoices} disabled={busy}>
          {t.engine.deleteVoices}
        </button>
      </p>
    </Page>
  );
}
