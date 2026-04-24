export const writeClipboardText = async (text) => {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    throw new Error('Clipboard access is unavailable on this browser.');
  }

  await navigator.clipboard.writeText(text);
};
