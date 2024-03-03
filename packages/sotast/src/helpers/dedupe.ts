export const dedupe: MethodDecorator = (target, propertyKey, descriptor) => {
  const originalMethod = descriptor.value! as any;
  let pendingResult: Promise<any> | null = null;
  (descriptor.value as any) = async function (this: any, ...args: any[]) {
    if (args[0]) {
      throw new Error('Dedupe methods cannot accept arguments');
    }

    if (pendingResult) {
      return pendingResult;
    }

    pendingResult = originalMethod.apply(this, args);
    const result = await pendingResult;
    pendingResult = null;
    return result;
  };
};
