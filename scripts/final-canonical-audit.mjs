import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function filesUnder(directory) {
  const entries = await readdir(path.join(root, directory), {
    withFileTypes: true,
  });
  const files = [];
  for (const entry of entries) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await filesUnder(relative)));
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      files.push(relative);
    }
  }
  return files;
}

const customerFiles = [
  ...(await filesUnder('components')),
  ...(await filesUnder('services')),
];
const sources = await Promise.all(
  customerFiles.map(async (file) => ({
    file,
    source: await readFile(path.join(root, file), 'utf8'),
  }))
);

const executablePatterns = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bsendBeacon\s*\(/,
  /\baxios\b/,
  /<form[^>]+\baction=/,
];

for (const { file, source } of sources) {
  for (const pattern of executablePatterns) {
    assert.equal(
      pattern.test(source),
      false,
      `${file} contains an external execution primitive: ${pattern}`
    );
  }

  if (file.endsWith('.tsx')) {
    for (const match of source.matchAll(/<button\b[\s\S]*?>/g)) {
      assert.match(
        match[0],
        /\bonClick=/,
        `${file} contains a button without an explicit interaction handler`
      );
    }
  }
}

const requiredFiles = [
  'docs/final-red-team-audit.md',
  'artifacts/final-audit/baseline/route-capture-summary.json',
  'artifacts/final-audit/deck-prototype-consistency.md',
];
for (const file of requiredFiles) {
  await readFile(path.join(root, file));
}

const packageJson = JSON.parse(
  await readFile(path.join(root, 'package.json'), 'utf8')
);
assert.ok(
  packageJson.scripts['verify:final'],
  'verify:final script is required'
);

console.log(
  `Final canonical audit passed: ${customerFiles.length} source files inspected.`
);
