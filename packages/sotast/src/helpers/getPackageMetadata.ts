import { execSync } from 'child_process';

export const getPackageMetadata = async () => {
  const version = await import('../../package.json').then((pkg) => pkg.default.version);
  if (process.env.BUILD_COMMIT && process.env.BUILD_BRANCH && process.env.BUILD_DATE) {
    return {
      commit: process.env.BUILD_COMMIT,
      branch: process.env.BUILD_BRANCH,
      version: process.env.BUILD_VERSION || version,
      buildDate: new Date(process.env.BUILD_DATE),
    };
  }

  const commit = execSync('git rev-parse HEAD').toString().trim();
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  const buildDate = Date.now();
  return {
    commit,
    branch,
    version,
    buildDate,
  };
};
