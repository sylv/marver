import { SetMetadata } from '@nestjs/common';
import type { ZodSchema, z } from 'zod';

export const CALLBACK_METADATA_KEY = Symbol('REHOBOAM_CALLBACK');

export type CallbackExample<DataType, SchemaType extends ZodSchema> = {
  data: DataType;
  result: z.infer<SchemaType>;
};

export interface CallbackMetadata<DataType = unknown, SchemaType extends ZodSchema = ZodSchema> {
  type: string;
  schema: SchemaType;
  defaultExamples: CallbackExample<DataType, SchemaType>[];
  prompt: {
    system: string;
    instruction: (data: DataType) => string;
    embedding: (data: DataType) => string;
  };
}

export const Callback = <DataType, SchemaType extends ZodSchema>(
  metadata: CallbackMetadata<DataType, SchemaType>,
) => {
  return SetMetadata(CALLBACK_METADATA_KEY, metadata);
};
