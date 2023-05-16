import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PlainLiteralObject,
  StreamableFile,
} from '@nestjs/common';
import { isObject } from 'class-validator';
import { wrap } from '@mikro-orm/core';
import { map, Observable } from 'rxjs';

@Injectable()
export class MikroOrmSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((res: PlainLiteralObject | Array<PlainLiteralObject>) => this.serialize(res)));
  }

  serialize(response: unknown): unknown {
    if (Array.isArray(response)) return response.map((item) => this.serialize(item));
    if (!isObject(response) || response instanceof StreamableFile) return response;
    return this.transformEntity(response);
  }

  transformEntity(plainOrEntity: any) {
    if ('__helper' in plainOrEntity) {
      // for mikroorm entities, we have to serialize them or else graphql won't
      // know how to get the data behind references and collections, etc.
      return wrap(plainOrEntity).toPOJO();
    }

    // for non-entity objects, we still have to check each property to see if it is
    // a mikroorm entity, because for example on paginated routes using createConnection()
    // the result is a plain object that contains entities in a nested array.
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(plainOrEntity)) {
      clean[key] = this.serialize(value);
    }

    return clean;
  }
}
