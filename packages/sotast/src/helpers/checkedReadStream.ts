import { createReadStream } from "fs";
import { once } from "events";

export const checkedReadStream = async (path: string) => {
  const stream = createReadStream(path);
  await once(stream, "open");
  return stream;
};
