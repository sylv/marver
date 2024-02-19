import { CodegenConfig } from '@graphql-codegen/cli';
import { ClientPresetConfig, FragmentMaskingConfig } from '@graphql-codegen/client-preset';

export default {
  overwrite: true,
  errorsOnly: true,
  schema: '../sotast/schema.gql',
  documents: 'src/**/*.graphql',
  generates: {
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
