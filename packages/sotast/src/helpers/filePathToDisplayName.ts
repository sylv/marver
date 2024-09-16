import { parse } from "path";

export const filePathToDisplayName = (filePath: string): string => {
  const path = parse(filePath);
  const spaces = path.name.split(" ").length;
  const dots = path.name.split(".").length;
  const underscores = path.name.split("_").length;
  if ((underscores <= 2 || dots <= 2) && spaces >= 4) return path.name;
  const uses = dots > underscores ? "." : "_";
  return path.name.split(uses).join(" ");
};
