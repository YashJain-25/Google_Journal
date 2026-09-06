// Pixel Material Haptics & System Feel
export function triggerPixelHaptic(duration = 10) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore vibration errors if unsupported
    }
  }
}
