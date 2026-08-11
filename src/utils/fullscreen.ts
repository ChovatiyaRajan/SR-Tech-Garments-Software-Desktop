export function isFullscreenSupported(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as any;
  const docEl = document.documentElement as any;
  return !!(
    docEl.requestFullscreen ||
    docEl.webkitRequestFullscreen ||
    docEl.mozRequestFullScreen ||
    docEl.msRequestFullscreen ||
    doc.fullscreenEnabled ||
    doc.webkitFullscreenEnabled
  );
}

export function isFullscreenActive(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as any;
  return !!(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
}

export async function enterFullscreen(): Promise<void> {
  if (typeof document === 'undefined') return;
  if (isFullscreenActive()) return;

  try {
    const docEl = document.documentElement as any;
    if (docEl.requestFullscreen) {
      await docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) {
      await docEl.webkitRequestFullscreen();
    } else if (docEl.mozRequestFullScreen) {
      await docEl.mozRequestFullScreen();
    } else if (docEl.msRequestFullscreen) {
      await docEl.msRequestFullscreen();
    }
  } catch (err) {
    // Browsers may reject requestFullscreen if not initiated by a user gesture or if blocked
    console.warn('Fullscreen request could not be fulfilled:', err);
  }
}

export async function exitFullscreen(): Promise<void> {
  if (typeof document === 'undefined') return;
  if (!isFullscreenActive()) return;

  try {
    const doc = document as any;
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
    }
  } catch (err) {
    console.warn('Exit fullscreen request could not be fulfilled:', err);
  }
}

export async function toggleFullscreen(): Promise<void> {
  if (isFullscreenActive()) {
    await exitFullscreen();
  } else {
    await enterFullscreen();
  }
}
