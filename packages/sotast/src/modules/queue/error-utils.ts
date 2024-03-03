import { JobError } from './job.error.js';

const NETWORK_ERRORS: (RegExp | string)[] = [
  // https://nodejs.org/api/errors.html
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'ETIMEDOUT',
  'ESOCKETTIMEDOUT',
  'EHOSTUNREACH',
  'EPIPE',
  'EAI_AGAIN',
  'ECONNABORTED',
  'ENETUNREACH',
  'ENETDOWN',
  'EADDRINFO',
  // random
  'timeout',
  'socket hang up',
  'no such host',
  'failed to connect',
  'no connection established',
];

const UNAVAILABLE_FILE_ERRORS: (RegExp | string)[] = [
  'ENOENT',
  'EACCES',
  'No such file',
  'Invalid image format',
  'unable to read file',
  /(image|file|video).not.found/i,
];

export const isNetworkError = (error: any): boolean => {
  if (error instanceof JobError && error.options.networkError) return true;
  const target = error.message.toLowerCase();
  return NETWORK_ERRORS.some((sample) => {
    if (typeof sample === 'string') {
      return target.includes(sample.toLowerCase());
    }

    return sample.test(error.message);
  });
};

/**
 * @warning This detects most "could not read file" errors, which can come from a variety of sources, like unsupported file types, or corrupt files.
 * You should check if the file is actually there - if it is, it's an error. If it was not, the file is unavailable and has to be marked as such.
 */
export const isUnavailableFileError = (error: any): boolean => {
  if (error instanceof JobError && error.options.unavailableFile) return true;
  const target = error.message.toLowerCase();
  return UNAVAILABLE_FILE_ERRORS.some((sample) => {
    if (typeof sample === 'string') {
      return target.includes(sample.toLowerCase());
    }

    return sample.test(error.message);
  });
};

export const isCorruptFileError = (error: unknown): boolean => {
  if (error instanceof JobError && error.options.corruptFile) return true;
  return false;
};
