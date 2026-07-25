export const PROTOTYPE_STORAGE_KEYS = [
  'bill-control-saved-plans',
  'bill-control-audit-events',
  'bill-control-local-reminders',
  'bill-control-consent-overrides',
  'bill-control-presentation-progress',
  'bill-control-faithfulness-test-state',
] as const;

export function resetPrototypeLocalState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  for (const key of PROTOTYPE_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Reset remains best-effort if browser storage is unavailable.
    }
  }
}
