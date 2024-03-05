import { resolveSelections, type FieldSelections } from '@jenyus-org/graphql-utils';
import { type AnyEntity } from '@mikro-orm/core';
import { RESOLVER_NAME_METADATA, TypeMetadataStorage } from '@nestjs/graphql';
import type { GraphQLResolveInfo } from 'graphql';

const FIELD_STORE = new Map<AnyEntity, FieldSelections[]>();

/**
 * Define which fields should be auto-populated when this property or method is queried.
 * @param populateList Defaults to the decorated property name.
 */
// note: Using `PropertyDecorator | MethodDecorator` causes a TypeError because MethodDecorator expects 3 args,
// idk why ts isnt smart enough to figure it out but whatever. this CAN and SHOULD be used on methods.
export const AutoPopulate = (populateList?: string | string[]): PropertyDecorator => {
  return (target: any, propertyKey: string | symbol) => {
    process.nextTick(() => {
      if (typeof propertyKey === 'symbol') {
        throw new TypeError('AutoPopulate does not support symbol properties');
      }

      // the target is either an @Entity() class, or a @Resolver() class
      let constructor = target.constructor;
      const resolverForType = Reflect.getMetadata(RESOLVER_NAME_METADATA, target.constructor) as
        | string
        | undefined;

      if (resolverForType) {
        // this is a @Resolver() class. this is a mess but it seems like the easiest way to get
        // the class that the resolver is resolving.
        const objectTypes = TypeMetadataStorage.getObjectTypesMetadata();
        const objectType = objectTypes.find((obj) => obj.name === resolverForType);
        if (!objectType) {
          throw new Error(`Could not find object type for resolver ${resolverForType}`);
        }

        constructor = objectType.target;
      }

      // todo: validate constructor is actually an entity.
      const fields = FIELD_STORE.get(constructor) ?? [];
      const value = populateList ?? propertyKey;
      if (Array.isArray(value)) {
        for (const populate of value) {
          fields.push({
            field: propertyKey,
            selector: populate,
          });
        }
      } else {
        fields.push({
          field: propertyKey,
          selector: value,
        });
      }

      FIELD_STORE.set(constructor, fields);
      return undefined;
    });
  };
};

/**
 * Infer the "populate" option for a given entity based on an incoming GraphQL query.
 * The entity should use `@AutoPopulate()` to mark fields that should be auto-populated.
 * @param entityPath The field in the query that corresponds to the entity.
 * For example, if the query is `file { id }`, then `atField` would be "file".
 * If the query was `files { edges { node { id } } }`, then `atField` would be "files.edges.node".
 */
export const inferPopulate = (entity: AnyEntity, entityPath: string, info: GraphQLResolveInfo) => {
  const nestedFields = FIELD_STORE.get(entity);
  if (!nestedFields) {
    throw new Error(`Entity ${entity.name} does not have any fields marked with @AutoPopulate`);
  }

  const fieldTree: FieldSelections[] = [];
  let previousField: FieldSelections | undefined;
  for (const pathpart of entityPath.split('.')) {
    const field: FieldSelections = {
      field: pathpart,
      selections: [],
    };

    if (previousField) previousField.selections!.push(field);
    else fieldTree.push(field);
    previousField = field;
  }
  previousField!.selections!.push(...nestedFields);

  return resolveSelections(fieldTree, info as any) as any[];
};
