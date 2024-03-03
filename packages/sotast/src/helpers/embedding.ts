import { Embedding } from '../@generated/core.js';

export function embeddingToBuffer(vector: Embedding) {
  const array = Embedding.toBinary(vector);
  return Buffer.from(array);
}

export function bufferToEmbedding(buffer: Buffer) {
  return Embedding.fromBinary(buffer);
}
