import { type CodegenConfig } from '@graphql-codegen/cli';
import { type ClientPresetConfig } from '@graphql-codegen/client-preset';

export default {
  overwrite: true,
  errorsOnly: true,
  schema: '../sotast/schema.gql',
  documents: 'src/**/*.graphql',
  generates: {
    'src/@generated/schema.json': {
      plugins: ['urql-introspection'],
    },
    'src/@generated/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      } satisfies ClientPresetConfig,
      config: {
        defaultScalarType: 'unknown',
        useTypeImports: true,
      },
    },
  },
} satisfies CodegenConfig;
