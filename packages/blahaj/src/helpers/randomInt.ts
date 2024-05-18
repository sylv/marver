export const seededRandom = (min: number, max: number, seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
};
