import type { Embedding } from '../@generated/core.js';

export const cosineSimilarity = (vec1: Embedding, vec2: Embedding) => {
  let dot = 0.0;
  let norm1 = 0.0;
  let norm2 = 0.0;
  for (let i = 0; i < vec1.value.length; i++) {
    dot += vec1.value[i] * vec2.value[i];
    norm1 += vec1.value[i] * vec1.value[i];
    norm2 += vec2.value[i] * vec2.value[i];
  }

  return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
};
