import { Type, type EntityProperty } from "@mikro-orm/core";

export class VectorType extends Type<number[], string> {
  private conversionFunction: "vector64" | "vector32" | "vector16" | "vectorb16" | "vector8" | "vector1bit";
  constructor(
    private type: "FB16_BLOB",
    private size: number,
  ) {
    super();
    this.conversionFunction = "vectorb16";
  }

  convertToDatabaseValue(value: number[]) {
    return JSON.stringify(Array.from(value));
  }

  convertToJSValue(value: string) {
    return JSON.parse(value);
  }

  convertToDatabaseValueSQL(key: string): string {
    return `vector_extract(${key})`;
  }

  convertToJSValueSQL(key: string): string {
    return `${this.conversionFunction}(${key})`;
  }

  getColumnType(prop: EntityProperty): string {
    return `${this.type}(${this.size})`;
  }
}
