import type { DemoScenario } from '@/domain/scenario';
import type { Recommendation } from '@/domain/recommendation';
import type { ForecastSurpriseEvaluation } from '@/domain/measurement';
import { evaluateForecastSurprise } from '@/lib/forecast-surprise-evaluator';

export class MockMeasurementService {
  getEstimatedBenefit(recommendation: Recommendation) {
    return recommendation.benefit;
  }

  getFinalBill(scenario: DemoScenario): number | undefined {
    return scenario.forecast.finalBill;
  }

  evaluateForecastSurprise(
    scenario: DemoScenario,
    currentDate?: string
  ): ForecastSurpriseEvaluation {
    if (
      !scenario.previousForecast ||
      scenario.forecast.finalBill === undefined
    ) {
      return {
        forecastSurprise: false,
        eligible: false,
        reason: 'Closed bill and communicated forecast are required',
      };
    }

    return evaluateForecastSurprise(
      scenario.previousForecast,
      scenario.forecast.finalBill,
      scenario.forecast.generatedAt,
      currentDate
    );
  }
}

export const mockMeasurementService = new MockMeasurementService();
