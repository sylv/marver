import fs from 'node:fs';
import { globSync } from 'glob';
import path from 'node:path';

// https://github.com/timostamm/protobuf-ts/pull/233#issuecomment-1289053379
const protoRoot = process.argv[2];
if (!protoRoot) throw new Error('No directory provided');
const resolved = path.resolve(protoRoot) + '/*.ts';
const files = globSync(resolved);
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content
    .split('\n')
    .map((s) =>
      s.replace(/^(import .+? from ["']\..+?)(["'];)$/, (match, name, extra) => {
        if (name.includes('.js')) return match;
        return `${name}.js${extra}`;
      })
    )
    .join('\n');

  const DISABLE_COMMENT = '\n';
  if (!content.startsWith(DISABLE_COMMENT)) content = DISABLE_COMMENT + content;
  fs.writeFileSync(file, content);
}
