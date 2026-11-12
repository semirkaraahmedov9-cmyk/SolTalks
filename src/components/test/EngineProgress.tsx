import { t } from '../../i18n';

export type ProgressState =
  | { stage: 'idle' }
  | { stage: 'downloading' | 'generating'; fraction: number }
  | { stage: 'message'; text: string };

/**
 * Progress bar plus a status line for screen readers. The status text only
 * changes in 10% steps, so screen readers are not flooded with announcements.
 */
export function EngineProgress({ state }: { state: ProgressState }) {
  const active = state.stage === 'downloading' || state.stage === 'generating';

  let status = '';
  if (state.stage === 'message') {
    status = state.text;
  } else if (active) {
    const step = Math.floor(state.fraction * 10) * 10;
    status = state.stage === 'downloading' ? t.engine.downloading(step) : t.engine.generating(step);
  }

  return (
    <div className="engine-progress">
      {active && (
        <>
          <label htmlFor="engine-progress-bar" className="visually-hidden">
            {t.test.progressLabel}
          </label>
          <progress id="engine-progress-bar" max={1} value={state.fraction} />
        </>
      )}
      <p role="status" className="status">
        {status}
      </p>
    </div>
  );
}
