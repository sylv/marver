import { BadRequestException } from '@nestjs/common';
import { once } from 'events';
import { createReadStream, type ReadStream } from 'fs';
import { FileEntity } from '../modules/file/entities/file.entity.js';
import { getEm } from './get-em.js';

export const UNAVAILBLE_ERROR_CODES = new Set(['ENOENT', 'EACCES', 'EISDIR']);

/**
 * The same as `createReadStream` but waits for the stream to open before returning it.
 * You can then try/catch the promise to handle ENOENT/EACCES errors etc.
 */
export const createDurableReadStream = async (
  path: string,
  options?: Parameters<typeof createReadStream>[1],
): Promise<ReadStream> => {
  const stream = createReadStream(path, options);
  await once(stream, 'open');
  return stream;
};

export const createDurableHttpReadStream = async (
  file: {
    path: string;
    id: string;
  },
  options?: Parameters<typeof createReadStream>[1],
): Promise<ReadStream> => {
  try {
    return await createDurableReadStream(file.path, options);
  } catch (error: any) {
    if (UNAVAILBLE_ERROR_CODES.has(error.code)) {
      const em = getEm();
      await em.nativeUpdate(FileEntity, { id: file.id }, { unavailable: true });
      throw new BadRequestException('File is unavailable');
    }

    throw error;
  }
};
