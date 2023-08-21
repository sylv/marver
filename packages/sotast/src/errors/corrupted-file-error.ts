export class CorruptedFileError extends Error {
  constructor(public readonly path: string) {
    super(`File at path "${path}" is corrupted.`);
    this.name = 'CorruptedFileError';
  }
}
