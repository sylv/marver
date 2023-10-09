export const formatNumber = (number: number) => {
  if (number < 1e3) return number;
  if (number < 1e6) return +(number / 1e3).toFixed(1) + 'k';
  if (number < 1e9) return +(number / 1e6).toFixed(1) + 'm';
  if (number < 1e12) return +(number / 1e9).toFixed(1) + 'b';
  return +(number / 1e12).toFixed(1) + 't';
};
