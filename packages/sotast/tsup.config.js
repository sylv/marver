import { createTsupConfig } from "../../tsup.config";

export default createTsupConfig({
  entry: [
    "src/main.ts",
    "src/orm.config.ts",
    "src/**/*.entity.ts",
    "src/migrations/*",
    "src/worker/*.ts",
    "src/tasks/**/*.ts",
  ],
});
