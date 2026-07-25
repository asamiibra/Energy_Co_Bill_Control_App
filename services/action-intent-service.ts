import type { Recommendation } from '@/domain/recommendation';

/**
 * Action Intent Service
 *
 * May save or modify customer intent but NEVER executes external actions.
 * The MVP is read-only and does not execute account, tariff, thermostat,
 * billing, or payment changes.
 */

export interface SavedActionPlan {
  planId: string;
  scenarioId: string;
  customerId: string;
  recommendationIds: string[];
  savedAt: string;
  modifiedAt?: string;
  reminderDate?: string;
  status: 'saved' | 'modified' | 'declined' | 'completed';
  notes?: string;
}

export class ActionIntentService {
  private plans: SavedActionPlan[] = [];
  private readonly storageKey = 'bill-control-saved-plans';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Save an action plan (intent only, no execution)
   */
  saveActionPlan(
    scenarioId: string,
    customerId: string,
    recommendations: Recommendation[],
    options?: {
      reminderDate?: string;
      notes?: string;
    }
  ): SavedActionPlan {
    if (
      recommendations.length === 0 ||
      recommendations.some(
        (recommendation) =>
          recommendation.status !== 'available' ||
          recommendation.mode === 'future_governed_action'
      )
    ) {
      throw new Error(
        'Only available MVP recommendations can be saved as customer intent'
      );
    }

    const plan: SavedActionPlan = {
      planId: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      scenarioId,
      customerId,
      recommendationIds: recommendations.map((r) => r.recommendationId),
      savedAt: new Date().toISOString(),
      status: 'saved',
      reminderDate: options?.reminderDate,
      notes: options?.notes,
    };

    this.plans.push(plan);
    this.saveToStorage();

    return plan;
  }

  /**
   * Modify an existing action plan
   */
  modifyActionPlan(
    planId: string,
    updates: {
      recommendationIds?: string[];
      reminderDate?: string;
      notes?: string;
    }
  ): SavedActionPlan | null {
    const planIndex = this.plans.findIndex((p) => p.planId === planId);
    if (planIndex === -1) return null;

    const updatedPlan: SavedActionPlan = {
      ...this.plans[planIndex],
      ...updates,
      modifiedAt: new Date().toISOString(),
      status: 'modified',
    };

    this.plans[planIndex] = updatedPlan;
    this.saveToStorage();

    return updatedPlan;
  }

  /**
   * Decline action plan
   */
  declineActionPlan(planId: string): boolean {
    const planIndex = this.plans.findIndex((p) => p.planId === planId);
    if (planIndex === -1) return false;

    this.plans[planIndex].status = 'declined';
    this.saveToStorage();

    return true;
  }

  /**
   * Mark action as self-reported completed
   */
  markActionCompleted(planId: string): boolean {
    const planIndex = this.plans.findIndex((p) => p.planId === planId);
    if (planIndex === -1) return false;

    this.plans[planIndex].status = 'completed';
    this.saveToStorage();

    return true;
  }

  /**
   * Get saved plans for a customer
   */
  getSavedPlans(customerId: string): SavedActionPlan[] {
    return this.plans.filter((p) => p.customerId === customerId);
  }

  /**
   * Get a specific plan
   */
  getPlan(planId: string): SavedActionPlan | null {
    return this.plans.find((p) => p.planId === planId) || null;
  }

  /**
   * Get plans for a scenario
   */
  getPlansForScenario(scenarioId: string): SavedActionPlan[] {
    return this.plans.filter((p) => p.scenarioId === scenarioId);
  }

  /**
   * Check if customer has active plans
   */
  hasActivePlans(customerId: string): boolean {
    return this.plans.some(
      (p) =>
        p.customerId === customerId &&
        (p.status === 'saved' || p.status === 'modified')
    );
  }

  /**
   * Clear all plans (for demo reset)
   */
  clearAllPlans(): void {
    this.plans = [];
    this.saveToStorage();
  }

  /**
   * IMPORTANT: This service CANNOT execute external actions
   * All methods above save intent only and do not:
   * - Change thermostat settings
   * - Switch tariffs
   * - Modify account settings
   * - Process payments
   * - Contact external systems
   */

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.plans));
      }
    } catch {
      // Local persistence is best-effort; intent remains in memory.
    }
  }

  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            this.plans = parsed.filter(
              (plan): plan is SavedActionPlan =>
                typeof plan === 'object' &&
                plan !== null &&
                typeof (plan as SavedActionPlan).planId === 'string' &&
                Array.isArray((plan as SavedActionPlan).recommendationIds)
            );
          }
        }
      }
    } catch {
      this.plans = [];
    }
  }
}

export const actionIntentService = new ActionIntentService();
