import type { IconType } from "react-icons/lib";
import { LuAperture, LuCamera, LuClock, LuFocus, LuSliders, LuSun, LuZap, LuZoomIn } from "react-icons/lu";
import type { FileExifPropsFragment } from "../../../../@generated/graphql";

export const EXIF_ICONS: Omit<
  Record<keyof FileExifPropsFragment["exifData"], IconType>,
  "__typename" | "longitude" | "latitude"
> = {
  cameraMake: LuCamera,
  cameraModel: LuCamera,
  lensMake: LuFocus,
  lensModel: LuFocus,
  dateTime: LuClock,
  exposureTime: LuSun,
  fNumber: LuAperture,
  flash: LuZap,
  focalLength: LuZoomIn,
  iso: LuSliders,
};
