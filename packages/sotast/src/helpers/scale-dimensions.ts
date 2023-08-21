export type Dimensions = {
  height: number;
  width: number;
};

export const scaleDimensions = (current: Dimensions, max: { maxHeight?: number; maxWidth?: number }) => {
  const { height, width } = current;
  const { maxHeight, maxWidth } = max;
  const ratio = Math.min(
    maxWidth ? maxWidth / width : Number.POSITIVE_INFINITY,
    maxHeight ? maxHeight / height : Number.POSITIVE_INFINITY,
  );

  if (ratio === Number.POSITIVE_INFINITY) return current;

  return {
    height: Math.round(height * ratio),
    width: Math.round(width * ratio),
  };
};
