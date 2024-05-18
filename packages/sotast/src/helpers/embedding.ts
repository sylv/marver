import { unpack, FLOAT32_OPTIONS, Packr } from "msgpackr";

export type Embedding = number[];

const packer = new Packr({
  useFloat32: FLOAT32_OPTIONS.ALWAYS,
});

export function embeddingToBuffer(embedding: Embedding) {
  return packer.pack(embedding);
}

export function bufferToEmbedding(buffer: Buffer): Embedding {
  const result = unpack(buffer) as unknown;
  if (!Array.isArray(result) || !(typeof result[0] === "number")) {
    throw new Error("Invalid embedding buffer");
  }

  return result;
}
