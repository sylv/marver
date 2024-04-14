import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts', 'src/**/*.entity.ts'],
  target: 'node16',
  format: 'esm',
  clean: true,
  platform: 'node',
  shims: true,
  splitting: true,
  minify: false,
  sourcemap: true,
  define: {
    'import.meta.vitest': 'undefined',
  }
});
