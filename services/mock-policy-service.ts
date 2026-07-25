import type { SafetyDecision } from '@/domain/safety';
import type { Recommendation } from '@/domain/recommendation';
import type { DemoScenario } from '@/domain/scenario';

/**
 * Mock Policy Service
 *
 * Owns:
 * - Eligibility
 * - Essential-use protection
 * - Recommendation suppression
 * - Usefulness threshold
 * - Safe alternative list
 */

export class MockPolicyService {
  /**
   * Get safety decision for a scenario
   */
  getSafetyDecision(scenario: DemoScenario): SafetyDecision {
    return scenario.safetyDecision;
  }

  /**
   * Check if a recommendation should be suppressed
   */
  shouldSuppressRecommendation(
    recommendation: Recommendation,
    safetyDecision: SafetyDecision
  ): boolean {
    return (
      safetyDecision.status === 'suppress' &&
      recommendation.policyDecisionId === safetyDecision.policyDecisionId
    );
  }

  /**
   * Filter recommendations based on policy
   */
  filterRecommendations(scenario: DemoScenario): Recommendation[] {
    const safetyDecision = this.getSafetyDecision(scenario);

    return scenario.recommendations.map((rec) => {
      if (this.shouldSuppressRecommendation(rec, safetyDecision)) {
        return {
          ...rec,
          status: 'suppressed' as const,
          benefit: undefined, // Remove benefit for suppressed recommendations
        };
      }
      return rec;
    });
  }

  /**
   * Get available (non-suppressed) recommendations
   */
  getAvailableRecommendations(scenario: DemoScenario): Recommendation[] {
    return this.filterRecommendations(scenario).filter(
      (rec) => rec.status === 'available'
    );
  }

  /**
   * Get suppressed recommendations
   */
  getSuppressedRecommendations(scenario: DemoScenario): Recommendation[] {
    return this.filterRecommendations(scenario).filter(
      (rec) => rec.status === 'suppressed'
    );
  }

  /**
   * Check if customer is eligible for forecasting
   */
  isEligibleForForecast(customerId: string): boolean {
    void customerId;
    // All synthetic customers are eligible
    return true;
  }

  /**
   * Get safe alternatives when recommendations are suppressed
   */
  getSafeAlternatives(safetyDecision: SafetyDecision): string[] {
    return safetyDecision.supportOptions;
  }

  /**
   * Evaluate essential use protection
   */
  hasEssentialUseProtection(scenario: DemoScenario): boolean {
    return (
      scenario.safetyDecision.reasonCode === 'essential_use_protection' &&
      scenario.safetyDecision.source === 'customer_declared'
    );
  }

  /**
   * Check if forecast meets usefulness threshold
   */
  meetsUsefulnessThreshold(scenario: DemoScenario): boolean {
    // Consider forecast useful if data quality is not insufficient
    return scenario.forecast.dataQualityTier !== 'insufficient';
  }
}

export const mockPolicyService = new MockPolicyService();
