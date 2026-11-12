import { t } from '../../i18n';
import type { TestRun } from '../../pages/TestPage';

const num = (value: number, digits = 1) => value.toLocaleString('bg-BG', { maximumFractionDigits: digits });
const secs = (ms: number) => t.test.seconds(num(ms / 1000));

/** Measurements, shown so Semir can report them from his phone. */
export function TestResults({ run }: { run: TestRun }) {
  const speed = run.durationSeconds / (run.synthMs / 1000);

  const rows: [string, string][] = [
    [t.test.audioLength, t.test.seconds(num(run.durationSeconds))],
    [t.test.fileSize, t.test.megabytes(num(run.audio.byteLength / 1e6, 2))],
    [t.test.synthTime, secs(run.synthMs)],
    [t.test.speed, t.test.speedValue(num(speed))],
    [t.test.chunks, String(run.chunkCount)],
    [t.test.totalTime, secs(run.totalMs)],
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
    </>
  );
}
