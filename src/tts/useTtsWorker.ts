import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorkerRequest, WorkerResponse } from './messages';

type ResultMessage = Extract<WorkerResponse, { type: 'result' }>;
type ProgressMessage = Extract<WorkerResponse, { type: 'progress' }>;

export interface TtsResult extends ResultMessage {
  /** Measured on the page: from the click until the audio was ready. */
  totalMs: number;
}

/** Starts the TTS worker for this page and sends it requests. */
export function useTtsWorker() {
  const workerRef = useRef<Worker | null>(null);
  const startRef = useRef(0);
  const [progress, setProgress] = useState<ProgressMessage | null>(null);
  const [result, setResult] = useState<TtsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.type === 'progress') {
        setProgress(message);
      } else if (message.type === 'result') {
        setResult({ ...message, totalMs: performance.now() - startRef.current });
        setBusy(false);
      } else {
        setError(message.message);
        setBusy(false);
      }
    };
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const synthesize = useCallback((request: WorkerRequest) => {
    startRef.current = performance.now();
    setBusy(true);
    setError(null);
    setProgress(null);
    workerRef.current?.postMessage(request);
  }, []);

  return { synthesize, progress, result, error, busy };
}
