import { createHash } from "node:crypto";

export const dedupe: MethodDecorator = (target, propertyKey, descriptor) => {
  const originalMethod = descriptor.value! as any;
  const pendingResults = new Map<string, Promise<any>>();

  (descriptor.value as any) = async function (this: any, ...args: any[]) {
    const key = args[0] ? createHash("sha256").update(JSON.stringify(args)).digest("hex") : "default";
    const pendingResult = pendingResults.get(key);
    if (pendingResult) {
      return pendingResult;
    }

    const promise = originalMethod.apply(this, args);
    pendingResults.set(key, promise);
    const result = await promise;
    pendingResults.delete(key);
    return result;
  };
};
