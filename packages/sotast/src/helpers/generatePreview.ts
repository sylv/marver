import sharp from "sharp";

export const generatePreview = (input: string) => {
  return sharp(input)
    .blur(2)
    .rotate()
    .resize(16, 16, { fit: "inside" })
    .webp({ quality: 5, alphaQuality: 5, smartSubsample: true })
    .toBuffer();
};
