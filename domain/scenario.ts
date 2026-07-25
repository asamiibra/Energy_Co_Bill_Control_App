import { z } from 'zod';
import { HouseholdProfileSchema } from './household';
import { ForecastSnapshotSchema } from './forecast';
import { ForecastDriverSchema } from './forecast-driver';
import { RecommendationSchema } from './recommendation';
import { SafetyDecisionSchema } from './safety';
import { ConsentStateSchema } from './consent';

export const DemoScenarioSchema = z.object({
  scenarioId: z.string(),
  scenarioName: z.string(),
  anchorDate: z.string(),
  household: HouseholdProfileSchema,
  cohortContext: z.object({
    billVolatility: z.enum(['low', 'medium', 'high', 'unknown']),
    renewalDaysRemaining: z.number().optional(),
    recentServiceContact: z.boolean(),
    dataEligibility: z.boolean(),
    newCustomer: z.boolean().optional(),
    householdHistoryDays: z.number().optional(),
    usageVariancePercent: z.number().optional(),
  }),
  forecast: ForecastSnapshotSchema,
  previousForecast: ForecastSnapshotSchema.optional(),
  drivers: z.array(ForecastDriverSchema),
  recommendations: z.array(RecommendationSchema),
  safetyDecision: SafetyDecisionSchema,
  consentState: ConsentStateSchema,
  futurePreview: z
    .discriminatedUnion('kind', [
      z.object({
        kind: z.literal('tariff'),
        currentAnnualCostRange: z.object({
          low: z.number(),
          high: z.number(),
        }),
        alternativeAnnualCostRange: z.object({
          low: z.number(),
          high: z.number(),
        }),
        potentialAnnualBenefit: z.object({
          low: z.number(),
          high: z.number(),
        }),
        exitFee: z.number(),
        higherPeakRates: z.boolean(),
        termMonths: z.number().int().positive(),
        assumptions: z.array(z.string()).min(1),
      }),
      z.object({
        kind: z.literal('connected-home'),
        liveTelemetryAvailable: z.literal(false),
        personalizedRecommendationsAvailable: z.boolean(),
        absentConsentPurposes: z.array(z.string()),
        partnerDependency: z.string(),
      }),
    ])
    .optional(),
});

export type DemoScenario = z.infer<typeof DemoScenarioSchema>;
