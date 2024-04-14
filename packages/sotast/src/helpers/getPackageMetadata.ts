import { execSync } from "node:child_process";

export const getPackageMetadata = async () => {
  const pkg = await import("../../package.json").then((pkg) => pkg.default);
  const { version, homepage } = pkg;
  if (process.env.BUILD_COMMIT && process.env.BUILD_BRANCH && process.env.BUILD_DATE) {
    return {
      commit: process.env.BUILD_COMMIT,
      branch: process.env.BUILD_BRANCH,
      homepage,
      version: process.env.BUILD_VERSION || pkg.version,
      buildDate: new Date(process.env.BUILD_DATE),
    };
  }

  const commit = execSync("git rev-parse HEAD").toString().trim();
  const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  const buildDate = Date.now();

  return {
    commit,
    branch,
    version,
    homepage,
    buildDate,
  };
};
