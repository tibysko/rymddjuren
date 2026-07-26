/**
 * Keep the display awake while the game is open. Browsers release screen wake
 * locks when a page is hidden, so request a new one when the child returns.
 * Unsupported browsers and rejected requests simply keep their normal sleep
 * behaviour.
 */
export function keepScreenAwake(): () => void {
  let lock: WakeLockSentinel | null = null
  let requestPending = false
  let stopped = false

  async function requestLock() {
    if (
      stopped ||
      requestPending ||
      lock ||
      document.visibilityState !== 'visible' ||
      !('wakeLock' in navigator)
    ) {
      return
    }

    requestPending = true
    try {
      const requestedLock = await navigator.wakeLock.request('screen')
      if (stopped) {
        void requestedLock.release()
        return
      }

      lock = requestedLock
      requestedLock.addEventListener(
        'release',
        () => {
          if (lock === requestedLock) lock = null
        },
        { once: true },
      )
    } catch {
      // Wake locks are optional and may be denied by the browser or OS.
    } finally {
      requestPending = false
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') void requestLock()
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  void requestLock()

  return () => {
    stopped = true
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    if (lock) void lock.release()
    lock = null
  }
}
