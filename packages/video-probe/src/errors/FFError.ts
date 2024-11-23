import { FFERRTAG } from "../helpers/fferrtag" assert { type: "macro" };

export enum FFErrorCode {
  InvalidPath = 1, // No such file or directory
  InvalidData = 2, // Invalid data found when processing input
  FileChanged = 3, // Input changed between reads
  HttpError = 4, // Generic HTTP errors
}

export class FFError extends Error {
  constructor(
    public code: FFErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "FFError";
  }
}

export const FF_ERROR_MAP = new Map<number, FFErrorCode>([
  [FFERRTAG("I", "N", "D", "A"), FFErrorCode.InvalidData],
  [FFERRTAG(0xf8, "4", "0", "0"), FFErrorCode.HttpError],
  [FFERRTAG(0xf8, "4", "0", "1"), FFErrorCode.HttpError],
  [FFERRTAG(0xf8, "4", "0", "3"), FFErrorCode.HttpError],
  [FFERRTAG(0xf8, "4", "0", "4"), FFErrorCode.HttpError],
  [FFERRTAG(0xf8, "4", "X", "X"), FFErrorCode.HttpError],
  [-0x636e6701, FFErrorCode.FileChanged],
  [-2, FFErrorCode.InvalidPath],
]);
