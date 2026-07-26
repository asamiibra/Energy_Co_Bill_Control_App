import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import prettier from 'prettier';
import ts from 'typescript';

const root = process.cwd();
const registry = JSON.parse(
  await readFile(path.join(root, 'data/interaction-registry.json'), 'utf8')
);
const sourceFields = [
  'interactionId',
  'route',
  'label',
  'expectedOutcome',
  'stateMutation',
  'service',
  'eventName',
  'testId',
];
const contractFields = [
  'interactionId',
  'route',
  'mode',
  'label',
  'controlType',
  'expectedOutcome',
  'stateMutation',
  'service',
  'eventName',
  'testId',
];

for (const entry of registry) {
  assert.equal(
    entry.length,
    sourceFields.length,
    `Invalid registry row: ${entry}`
  );
  entry.forEach((value) => assert.ok(value, `Empty registry value: ${entry}`));
}

async function filesUnder(directory) {
  const entries = await readdir(path.join(root, directory), {
    withFileTypes: true,
  });
  const files = [];
  for (const entry of entries) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(relative)));
    else if (entry.name.endsWith('.tsx')) files.push(relative);
  }
  return files;
}

function interactionId(attribute) {
  const initializer = attribute.initializer;
  if (ts.isStringLiteral(initializer)) return initializer.text;
  if (!ts.isJsxExpression(initializer) || !initializer.expression) return null;
  const expression = initializer.expression;
  if (ts.isStringLiteral(expression)) return expression.text;
  if (ts.isTemplateExpression(expression)) {
    return `${expression.head.text}${expression.templateSpans
      .map((span) => `*${span.literal.text}`)
      .join('')}`;
  }
  return null;
}

const discovered = new Map();
const missing = [];
for (const file of await filesUnder('components')) {
  const source = await readFile(path.join(root, file), 'utf8');
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(sourceFile);
      if (
        ['button', 'input', 'textarea', 'summary', 'a', 'Link'].includes(tag)
      ) {
        const attribute = node.attributes.properties.find(
          (property) =>
            ts.isJsxAttribute(property) &&
            property.name.getText(sourceFile) === 'data-interaction-id'
        );
        if (!attribute) {
          const line =
            sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          missing.push(`${file}:${line} <${tag}>`);
        } else {
          const id = interactionId(attribute);
          assert.ok(id, `Interaction ID must be static or templated: ${file}`);
          const existingTag = discovered.get(id);
          assert.ok(
            !existingTag || existingTag === tag,
            `Interaction ID ${id} is used by both <${existingTag}> and <${tag}>`
          );
          discovered.set(id, tag);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
}

assert.deepEqual(
  missing,
  [],
  `Unclassified interactions:\n${missing.join('\n')}`
);
const declared = new Set(registry.map(([id]) => id));
assert.deepEqual(
  [...discovered.keys()].filter((id) => !declared.has(id)),
  [],
  'Source interaction is missing from registry'
);
assert.deepEqual(
  [...declared].filter((id) => !discovered.has(id)),
  [],
  'Registry interaction is missing from source'
);

const modeForRoute = (route) => {
  if (route === 'presentation') return 'presentation';
  if (route === 'demo') return 'demo';
  if (route === 'error' || route === 'unknown') return 'error';
  if (route === 'all') return 'all';
  return 'customer';
};
const contract = registry.map(
  ([
    interactionId,
    route,
    label,
    expectedOutcome,
    stateMutation,
    service,
    eventName,
    testId,
  ]) => ({
    interactionId,
    route,
    mode: modeForRoute(route),
    label,
    controlType: discovered.get(interactionId),
    expectedOutcome,
    stateMutation,
    service,
    eventName,
    testId,
  })
);
const expectedTestFiles = new Map([
  [
    'interaction-completeness',
    path.join(root, 'tests/e2e/interaction-completeness.spec.ts'),
  ],
]);
for (const { testId } of contract) {
  const testFile = expectedTestFiles.get(testId);
  assert.ok(testFile, `Unknown test reference: ${testId}`);
  await readFile(testFile, 'utf8');
}
const rows = contract.map(
  (entry) =>
    `| ${contractFields
      .map((field) => `\`${String(entry[field])}\``)
      .join(' | ')} |`
);
const interactionContract = `# Bill Control Interaction Contract

Every intentional customer or demo interaction is functional. No production
utility action is connected. Pattern IDs ending in \`*\` cover fixture-driven
instances with the same contract.

| ${contractFields.join(' | ')} |
| ${contractFields.map(() => '---').join(' | ')} |
${rows.join('\n')}
`;
await writeFile(
  path.join(root, 'docs/interaction-contract.md'),
  await prettier.format(interactionContract, { parser: 'markdown' })
);

console.log(
  `Interaction contract passed: ${discovered.size} source definitions, ${contract.length} typed registry contracts.`
);
