/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */

export type SigLIP = SigLip
export class SigLip {
  constructor(quantized: boolean)
  batchEncodeImages(imagePaths: Array<string>): Promise<Array<Array<number>>>
  batchEncodeTexts(texts: Array<string>): Promise<Array<Array<number>>>
  unloadTextualSession(): void
  unloadVisualSession(): void
}
