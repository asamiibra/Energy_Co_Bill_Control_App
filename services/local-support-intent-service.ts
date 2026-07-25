export type SupportIntent = {
  intentId: string;
  scenarioId: string;
  kind: 'budget_plan' | 'assistance_programs' | 'advisor';
  preference?: 'call' | 'message' | 'contact_information';
  savedAt: string;
};

const storageKey = 'bill-control-support-interests';

export function saveSupportIntent(
  intent: Omit<SupportIntent, 'intentId' | 'savedAt'>
): SupportIntent {
  const savedIntent: SupportIntent = {
    ...intent,
    intentId: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(storageKey);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const existing = Array.isArray(parsed) ? parsed : [];
    localStorage.setItem(
      storageKey,
      JSON.stringify([...existing, savedIntent])
    );
  } catch {
    // The interaction remains useful in memory when persistence is unavailable.
  }

  return savedIntent;
}
