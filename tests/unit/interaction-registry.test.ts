import { describe, expect, it } from 'vitest';

import { interactionRegistry } from '@/domain/interaction-contract';

describe('interaction registry', () => {
  it('defines one complete typed contract per source interaction', () => {
    expect(interactionRegistry.length).toBeGreaterThanOrEqual(70);
    expect(
      new Set(interactionRegistry.map(({ interactionId }) => interactionId))
        .size
    ).toBe(interactionRegistry.length);

    for (const contract of interactionRegistry) {
      expect(Object.keys(contract)).toEqual([
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
      ]);
      expect(
        Object.values(contract).every((value) => value.trim().length > 0)
      ).toBe(true);
      expect(contract.testId).toBe('interaction-completeness');
    }
  });
});
