export const cosineSimilarity = (a: number[], b: number[]) => {
  const dot = a.reduce((acc, _, i) => acc + a[i] * b[i], 0);
  const magA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
  return dot / (magA * magB);
};
