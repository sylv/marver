import { Injectable, Logger } from "@nestjs/common";
import { Worker } from "worker_threads";

const workerPath = require.resolve("./tasks");

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private worker?: Worker;
  private workerLastStartedAt?: number;

  get timeSinceWorkerStart() {
    if (!this.workerLastStartedAt) return null;
    return Date.now() - this.workerLastStartedAt;
  }

  runWorker() {
    if (this.worker) {
      throw new Error("Worker already running");
    }

    this.workerLastStartedAt = Date.now();
    this.worker = new Worker(workerPath);
    this.worker.on("exit", (code) => {
      if (this.timeSinceWorkerStart && this.timeSinceWorkerStart < 5000) {
        this.logger.error(`Worker stopped with exit code ${code}, exit too early so not restarting`);
        process.exit(1);
      }

      this.logger.error(`Worker stopped with exit code ${code}, trying restart`);
      this.worker = undefined;
      void this.runWorker();
    });

    this.logger.log("Worker started");
  }
}
