import { Type, type EntityProperty } from "@mikro-orm/core";

export class VectorType extends Type<number[], string> {
  convertToDatabaseValue(value: number[] | Float32Array | Float64Array) {
    return JSON.stringify(Array.from(value));
  }

  convertToJSValue(value: string) {
    return JSON.parse(value);
  }

  convertToDatabaseValueSQL(key: string): string {
    return `vec_to_blob(${key})`;
  }

  convertToJSValueSQL(key: string): string {
    return `vec_from_blob(${key})`;
  }

  getColumnType(prop: EntityProperty): string {
    return "blob";
  }
}
