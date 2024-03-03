interface JobErrorOptions {
  corruptFile?: boolean;
  unavailableFile?: boolean;
  networkError?: boolean;
}

export class JobError extends Error {
  constructor(
    message: string,
    public options: JobErrorOptions,
  ) {
    super(message);
  }
}
