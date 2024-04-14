import { createReadStream } from "node:fs";
import { once } from "node:events";

export const checkedReadStream = async (path: string) => {
  const stream = createReadStream(path);
  await once(stream, "open");
  return stream;
};
