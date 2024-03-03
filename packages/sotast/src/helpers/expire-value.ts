export const expiringValue = <T>(
  expiresIn: number,
  dispose: (value: T) => Promise<void> | void,
): { value: T | undefined } => {
  const target = {} as { value: T | undefined };
  let timeout: NodeJS.Timeout | undefined;
  const upsertTimeout = () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (target.value) {
        Promise.resolve(dispose(target.value)).catch((error) => {
          console.error('Error disposing value', error);
          process.exit(1);
        });
      }

      target.value = undefined;
    }, expiresIn);
  };

  return new Proxy(target, {
    set: (target, prop, value) => {
      if (prop === 'value') {
        if (target.value) {
          dispose(target.value);
        }

        target.value = value;
        upsertTimeout();
        return true;
      }

      return false;
    },
    get: (target, prop) => {
      if (prop === 'value') {
        upsertTimeout();
        return target.value;
      }

      return undefined;
    },
  });
};
