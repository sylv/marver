import { defineConfig, Options } from "tsup";
import macros from "unplugin-macros/esbuild";

export const createTsupConfig = (options?: Partial<Options>) => {
  return defineConfig({
    entry: ["src/index.ts"],
    format: "esm",
    target: "node20",
    outDir: "dist",
    clean: true,
    splitting: true,
    dts: false,
    sourcemap: true,
    keepNames: true,
    esbuildPlugins: [macros()],
    define: {
      "import.meta.vitest": "undefined",
    },
    banner: {
      //https://github.com/evanw/esbuild/issues/1921
      js: `
      const require = (await import("node:module")).createRequire(import.meta.url);
      const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
      const __dirname = (await import("node:path")).dirname(__filename);
      `,
    },
    ...options,
  });
};
