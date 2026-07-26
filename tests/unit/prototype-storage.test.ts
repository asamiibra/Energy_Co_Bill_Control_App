import { describe, expect, it, vi } from 'vitest';

import {
  PROTOTYPE_STORAGE_KEYS,
  resetPrototypeLocalState,
} from '@/lib/prototype-storage';

describe('prototype storage reset', () => {
  it('removes every prototype key and preserves unrelated storage', () => {
    resetPrototypeLocalState();

    for (const key of PROTOTYPE_STORAGE_KEYS) {
      expect(localStorage.removeItem).toHaveBeenCalledWith(key);
    }
    expect(localStorage.removeItem).toHaveBeenCalledTimes(
      PROTOTYPE_STORAGE_KEYS.length
    );
    expect(localStorage.removeItem).not.toHaveBeenCalledWith(
      'unrelated-storage-key'
    );
    expect(vi.mocked(localStorage.removeItem).mock.calls).toHaveLength(
      PROTOTYPE_STORAGE_KEYS.length
    );
  });
});
