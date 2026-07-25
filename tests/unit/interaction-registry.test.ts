import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type InteractionContract = [
  id: string,
  route: string,
  label: string,
  behavior: string,
  stateChange: string,
  service: string,
  event: string,
  test: string,
];

const registry = JSON.parse(
  readFileSync(resolve(process.cwd(), 'data/interaction-registry.json'), 'utf8')
) as InteractionContract[];

describe('interaction registry', () => {
  it('defines one complete contract per source interaction', () => {
    expect(registry.length).toBeGreaterThanOrEqual(70);
    expect(new Set(registry.map(([id]) => id)).size).toBe(registry.length);

    for (const contract of registry) {
      expect(contract).toHaveLength(8);
      expect(contract.every((value) => value.trim().length > 0)).toBe(true);
      expect(contract[7]).toBe('interaction-completeness');
    }
  });
});
