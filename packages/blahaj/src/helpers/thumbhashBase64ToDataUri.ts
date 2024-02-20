/* eslint-disable unicorn/prefer-code-point */
import { thumbHashToDataURL } from 'thumbhash';

export const thumbhashBase64ToDataUri = (previewBase64: string | undefined | null, aspectRatio?: number) => {
  if (!previewBase64) return undefined;
  const hash = Uint8Array.from(atob(previewBase64), (c) => c.charCodeAt(0));
  return thumbHashToDataURL(hash, aspectRatio);
};
