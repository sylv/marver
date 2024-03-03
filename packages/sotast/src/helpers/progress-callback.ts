import { Logger } from '@nestjs/common';

export type ProgressData =
  | {
      status: 'download' | 'initiate' | 'done';
      name: string;
      file: string;
    }
  | {
      status: 'progress';
      name: string;
      file: string;
      progress: number;
      loaded: number;
      total: number;
    };

const logger = new Logger('huggingface');
export const progressCallback = (data: ProgressData) => {
  if (data.status === 'download') {
    logger.log(`Downloading ${data.name}/${data.file}...`);
  } else if (data.status === 'done') {
    logger.log(`Downloaded ${data.name}/${data.file}`);
  }
};
