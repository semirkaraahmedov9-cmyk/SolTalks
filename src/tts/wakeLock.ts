// Keeps the screen on while long audio is generated, so a phone does not go
// to sleep (and pause the work) halfway through a chapter. Not supported in
// every browser; then nothing happens and generation still works.

let sentinel: WakeLockSentinel | null = null;
let wanted = false;

async function request(): Promise<void> {
  try {
    if (wanted && !sentinel && 'wakeLock' in navigator && document.visibilityState === 'visible') {
      sentinel = await navigator.wakeLock.request('screen');
      sentinel.addEventListener('release', () => (sentinel = null));
    }
  } catch {
    // Refused (e.g. battery saver). Not critical.
  }
}

// The browser drops the lock when the tab is hidden; take it again on return.
function onVisibilityChange() {
  if (document.visibilityState === 'visible') void request();
}

export function keepScreenOn(): void {
  wanted = true;
  document.addEventListener('visibilitychange', onVisibilityChange);
  void request();
}

export function allowScreenOff(): void {
  wanted = false;
  document.removeEventListener('visibilitychange', onVisibilityChange);
  void sentinel?.release().catch(() => {});
  sentinel = null;
}
