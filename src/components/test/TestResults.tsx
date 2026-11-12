import { t } from '../../i18n';
import type { TtsResult } from '../../tts/useTtsWorker';

const num = (value: number, digits = 1) => value.toLocaleString('bg-BG', { maximumFractionDigits: digits });
const secs = (ms: number) => t.test.seconds(num(ms / 1000));

/** The Phase 1 measurements, shown so Semir can report them from his phone. */
export function TestResults({ result }: { result: TtsResult }) {
  const { timings } = result;
  const speed = result.audioSeconds / (timings.synthMs / 1000);

  const rows: [string, string][] = [
    [
      t.test.voiceSize,
      `${t.test.megabytes(num(result.voiceBytes / 1e6))}${result.voiceFromCache ? ` ${t.test.fromCache}` : ''}`,
    ],
    [t.test.downloadTime, secs(timings.downloadMs)],
    [t.test.loadTime, secs(timings.loadMs)],
    [t.test.synthTime, secs(timings.synthMs)],
    [t.test.audioLength, t.test.seconds(num(result.audioSeconds))],
    [t.test.speed, t.test.speedValue(num(speed))],
    [t.test.totalTime, secs(result.totalMs)],
  ];

  return (
    <>
      <h2>{t.test.resultsHeading}</h2>
      <dl className="results">
        {rows.map(([label, value]) => (
          <div key={label} className="results__row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <details>
        <summary>{t.test.phonemesHeading}</summary>
        {/* lang="und": IPA symbols, not Bulgarian words. */}
        <ol lang="und" className="phonemes">
          {result.phonemes.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>
        {result.missingPhonemes.length > 0 && (
          <p>{t.test.missingPhonemes(result.missingPhonemes.join(' '))}</p>
        )}
      </details>
    </>
  );
}
