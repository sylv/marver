import { once } from "events";
import { type ReadStream, createReadStream } from "fs";
import { readFile } from "fs/promises";
import { EntityManager } from "@mikro-orm/libsql";
import { type EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BadRequestException, Injectable } from "@nestjs/common";
import { FileEntity } from "../file/entities/file.entity";

const UNAVAILBLE_ERROR_CODES = new Set(["ENOENT", "EACCES", "EISDIR"]);

type CreateReadStreamOptions = Parameters<typeof createReadStream>[1];

@Injectable()
export class StorageService {
  @InjectRepository(FileEntity) private fileRepo: EntityRepository<FileEntity>;
  constructor(private em: EntityManager) {}

  /**
   * The same as `createReadStream` but waits for the stream to open before returning it.
   * If the file is unavailable, it will mark the file as unavailable and return null.
   */
  async createReadStream(
    file: { id: string; path: string },
    options?: CreateReadStreamOptions,
  ): Promise<ReadStream | null> {
    try {
      const stream = createReadStream(file.path, options);
      await once(stream, "open");
      return stream;
    } catch (error: any) {
      if (UNAVAILBLE_ERROR_CODES.has(error.code)) {
        const fileRef = this.fileRepo.getReference(file.id);
        fileRef.unavailable = true;
        await this.em.persistAndFlush(fileRef);
        return null;
      }

      throw error;
    }
  }

  /**
   * The same as StorageService.createReadStream but throws a BadRequestException if the file is unavailable.
   */
  async createReadStreamHttp(
    file: { id: string; path: string },
    options?: CreateReadStreamOptions,
  ): Promise<ReadStream> {
    const stream = await this.createReadStream(file, options);
    if (!stream) throw new BadRequestException("File is unavailable");
    return stream;
  }

  /**
   * The same as `readFile` but waits for the file to be read before returning it.
   * If the file is unavailable, it will mark the file as unavailable and return null.
   */
  async readFile(file: { id: string; path: string }): Promise<Buffer | null> {
    try {
      return await readFile(file.path);
    } catch (error: any) {
      if (UNAVAILBLE_ERROR_CODES.has(error.code)) {
        const fileRef = this.fileRepo.getReference(file.id);
        fileRef.unavailable = true;
        await this.em.persistAndFlush(fileRef);
        return null;
      }

      throw error;
    }
  }
}
