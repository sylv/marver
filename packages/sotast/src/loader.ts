type LoaderFunc<Key, Value> = (keys: Key[]) => Promise<Value[]>;
type Batch<Key, Value> = {
  keys: Key[];
  resolve: (value: Value[]) => void;
  reject: (error: Error) => void;
};

export class Loader<Key, Value> {
  private static readonly MAX_WAIT = 25; // delay the batch up to this amount of time
  private static readonly BATCH_INTERVAL = 5; // wait this long for new keys to be added to the batch
  private static readonly MAX_BATCH_SIZE = 100;

  private loader: LoaderFunc<Key, Value>;
  private timer: NodeJS.Timeout | null = null;
  private pendingPromises: Batch<Key, Value>[] = [];
  private pendingKeys = 0;
  private batchStartedAt: number | null = null;

  constructor(loader: LoaderFunc<Key, Value>) {
    this.loader = loader;
  }

  public load(key: Key): Promise<Value> {
    return new Promise<Value>((resolve, reject) => {
      this.pendingKeys += 1;
      this.pendingPromises.push({
        keys: [key],
        reject: reject,
        resolve: (values) => resolve(values[0]),
      });

      this.resetTimer();
    });
  }

  public loadMany(keys: Key[]): Promise<Value[]> {
    return new Promise<Value[]>((resolve, reject) => {
      this.pendingKeys += keys.length;
      this.pendingPromises.push({
        keys,
        reject,
        resolve,
      });

      this.resetTimer();
    });
  }

  private resetTimer() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const isMaxKeys = this.pendingKeys >= Loader.MAX_BATCH_SIZE;
    const isMaxWait = this.batchStartedAt && Date.now() - this.batchStartedAt > Loader.MAX_WAIT;
    if (isMaxKeys || isMaxWait) {
      this.flush();
      return;
    }

    if (this.batchStartedAt === null) {
      this.batchStartedAt = Date.now();
    }

    this.timer = setTimeout(() => {
      this.flush();
    }, Loader.BATCH_INTERVAL);
  }

  private async flush() {
    try {
      const pendingPromises = this.pendingPromises;
      this.pendingPromises = [];
      this.pendingKeys = 0;
      this.batchStartedAt = null;

      const allKeys = this.pendingPromises.flatMap((batch) => batch.keys);
      const uniqueKeys = [...new Set(allKeys)];

      const values = await this.loader(uniqueKeys);
      const valueMap = new Map<Key, Value>(uniqueKeys.map((key, index) => [key, values[index]]));

      for (const batch of pendingPromises) {
        const batchValues = batch.keys.map((key) => valueMap.get(key)!);
        batch.resolve(batchValues);
      }
    } catch (error: any) {
      for (const batch of this.pendingPromises) {
        batch.reject(error);
      }
    }
  }
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  const createLoader = () => {
    const loaderFunc = async (keys: number[]) => keys.map((key) => `value${key}`);
    return new Loader(loaderFunc);
  };

  it("loads a single key", async () => {
    const loader = createLoader();
    const result = await loader.load(1);
    expect(result).toBe("value1");
  });

  it("loads multiple keys", async () => {
    const loader = createLoader();
    const results = await loader.loadMany([1, 2, 3]);
    expect(results).toEqual(["value1", "value2", "value3"]);
  });
}
