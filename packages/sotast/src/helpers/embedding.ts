import { Embedding } from '../@generated/solomon.js';

export function embeddingToBuffer(vector: Embedding) {
  const array = Embedding.toBinary(vector);
  return Buffer.from(array);
}

export function bufferToEmbedding(buffer: Buffer) {
  return Embedding.fromBinary(buffer);
}

export function embeddingFrom(value: number[]) {
  return Embedding.fromJson({ value });
}
