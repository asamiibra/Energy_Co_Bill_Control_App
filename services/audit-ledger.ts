import { PrototypeEventSchema, type PrototypeEvent } from '@/domain/event';

/**
 * Audit Ledger
 *
 * Local in-memory and localStorage event store for the prototype.
 * No third-party analytics SDK is used.
 *
 * Stores events with full correlation IDs for traceability.
 */

export class AuditLedger {
  private events: PrototypeEvent[] = [];
  private sessionId?: string;
  private readonly storageKey = 'bill-control-audit-events';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Record a new event
   */
  recordEvent(
    eventName: string,
    context: {
      scenarioId: string;
      householdId: string;
      forecastVersionId?: string;
      recommendationId?: string;
      policyDecisionId?: string;
      consentVersionId?: string;
      properties?: Record<string, unknown>;
    }
  ): PrototypeEvent {
    const sessionId = this.getSessionId();
    const event: PrototypeEvent = {
      eventId: crypto.randomUUID(),
      sessionId,
      traceId: crypto.randomUUID(),
      scenarioId: context.scenarioId,
      householdId: context.householdId,
      forecastVersionId: context.forecastVersionId,
      recommendationId: context.recommendationId,
      policyDecisionId: context.policyDecisionId,
      consentVersionId: context.consentVersionId,
      eventName,
      occurredAt: new Date().toISOString(),
      properties: context.properties || {},
    };

    this.events.push(event);
    this.saveToStorage();

    return event;
  }

  recordEventOnce(
    eventName: string,
    context: Parameters<AuditLedger['recordEvent']>[1]
  ): PrototypeEvent {
    const sessionId = this.getSessionId();
    const existing = this.events.find(
      (event) =>
        event.sessionId === sessionId &&
        event.eventName === eventName &&
        event.scenarioId === context.scenarioId
    );

    return existing ?? this.recordEvent(eventName, context);
  }

  /**
   * Get all events for current session
   */
  getSessionEvents(): PrototypeEvent[] {
    const sessionId = this.getSessionId();
    return this.events.filter((event) => event.sessionId === sessionId);
  }

  /**
   * Get all events
   */
  getAllEvents(): PrototypeEvent[] {
    return [...this.events];
  }

  /**
   * Get events by scenario
   */
  getEventsByScenario(scenarioId: string): PrototypeEvent[] {
    return this.events.filter((e) => e.scenarioId === scenarioId);
  }

  /**
   * Get events by name
   */
  getEventsByName(eventName: string): PrototypeEvent[] {
    return this.events.filter((e) => e.eventName === eventName);
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this.events = [];
    this.saveToStorage();
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    this.sessionId ??= crypto.randomUUID();
    return this.sessionId;
  }

  /**
   * Reset session (new session ID)
   */
  resetSession(): void {
    this.sessionId = crypto.randomUUID();
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.events));
      }
    } catch {
      // Local storage is best-effort; in-memory audit remains available.
    }
  }

  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            this.events = parsed.flatMap((event) => {
              const result = PrototypeEventSchema.safeParse(event);
              return result.success ? [result.data] : [];
            });
          }
        }
      }
    } catch {
      this.events = [];
    }
  }
}

// Singleton instance
export const auditLedger = new AuditLedger();
