import type { ForecastSnapshot } from '@/domain/forecast';
import type { ForecastDriver } from '@/domain/forecast-driver';
import type { DemoScenario } from '@/domain/scenario';

/**
 * Mock Forecast Service
 *
 * Owns:
 * - Expected bill
 * - Expected range
 * - Forecast version
 * - Generated timestamp
 * - Data-quality tier
 * - Source cadence
 * - Missing-data count
 */

export class MockForecastService {
  /**
   * Get current forecast for a scenario
   */
  getCurrentForecast(scenario: DemoScenario): ForecastSnapshot {
    return scenario.forecast;
  }

  /**
   * Get previous forecast if available
   */
  getPreviousForecast(scenario: DemoScenario): ForecastSnapshot | undefined {
    return scenario.previousForecast;
  }

  /**
   * Get forecast drivers
   */
  getForecastDrivers(scenario: DemoScenario): ForecastDriver[] {
    return scenario.drivers;
  }

  /**
   * Generate a new forecast (returns existing fixture data)
   */
  generateForecast(
    customerId: string,
    billingPeriodEnd: string
  ): ForecastSnapshot {
    // In a real implementation, this would call the forecasting model
    // For the prototype, return synthetic data
    const now = new Date();
    const versionId = `FCST-${customerId.split('-')[1]}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-01`;

    return {
      forecastVersionId: versionId,
      generatedAt: now.toISOString(),
      billingPeriodStart: '2026-07-03',
      billingPeriodEnd,
      billToDate: 128.36,
      expectedBill: 178,
      expectedRange: {
        low: 171,
        high: 204,
      },
      daysRemaining: 8,
      dataQualityTier: 'full',
      sourceCadence: 'interval',
      missingMeterDays: 0,
    };
  }

  /**
   * Check if forecast needs revision
   */
  needsRevision(currentForecast: ForecastSnapshot): boolean {
    // Simple heuristic: revise if more than 7 days old
    const generated = new Date(currentForecast.generatedAt);
    const now = new Date();
    const daysDiff =
      (now.getTime() - generated.getTime()) / (1000 * 60 * 60 * 24);

    return daysDiff > 7;
  }

  /**
   * Get data quality assessment
   */
  getDataQualityAssessment(scenario: DemoScenario): {
    tier: 'full' | 'limited' | 'insufficient';
    reason: string;
    missingDays: number;
  } {
    return {
      tier: scenario.forecast.dataQualityTier,
      reason:
        scenario.forecast.missingMeterDays > 0
          ? `${scenario.forecast.missingMeterDays} days of meter data missing`
          : 'Complete interval data available',
      missingDays: scenario.forecast.missingMeterDays,
    };
  }
}

export const mockForecastService = new MockForecastService();
