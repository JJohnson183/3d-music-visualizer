

/** Format seconds into M:SS (e.g. 73 → "1:13") */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Pad seconds with leading zero (e.g. 1:5 -> 1:05)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}