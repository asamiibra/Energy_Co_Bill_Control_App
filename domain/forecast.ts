import { z } from 'zod';

export const ForecastMissEvaluationSchema = z.object({
  forecastSurprise: z.boolean(),
  missDirection: z.enum(['upper', 'lower']).optional(),
  missAmountBeyondRange: z.number().optional(),
  lastValidCommunicatedRange: z
    .object({
      low: z.number(),
      high: z.number(),
    })
    .optional(),
  lastCommunicatedAt: z.string().optional(),
  billingCloseAt: z.string().optional(),
  hoursBeforeClose: z.number().optional(),
  evaluationValid: z.boolean(),
});

export const ForecastSnapshotSchema = z
  .object({
    forecastVersionId: z.string(),
    generatedAt: z.string(),
    billingPeriodStart: z.string(),
    billingPeriodEnd: z.string(),
    billToDate: z.number(),
    expectedBill: z.number(),
    expectedRange: z.object({
      low: z.number(),
      high: z.number(),
    }),
    daysRemaining: z.number().int().nonnegative(),
    dataQualityTier: z.enum(['full', 'limited', 'insufficient']),
    sourceCadence: z.enum([
      'interval',
      'monthly-read',
      'batch',
      'cohort-based',
      'final-bill',
    ]),
    missingMeterDays: z.number().int().nonnegative(),
    materialChangeReasons: z
      .array(
        z.enum([
          'point_estimate_movement',
          'range_width_increase',
          'data_quality_degradation',
          'recommendation_changed',
          'safety_state_changed',
        ])
      )
      .optional(),
    // New fields for resilience states
    intervalDataAvailable: z.boolean().optional(),
    cohortBased: z.boolean().optional(),
    billingStatus: z.enum(['open', 'closed']).optional(),
    communicationStatus: z
      .enum(['communicated', 'superseded', 'withdrawn'])
      .optional(),
    eligibleAtCommunication: z.boolean().optional(),
    finalBill: z.number().optional(),
    forecastMissEvaluation: ForecastMissEvaluationSchema.optional(),
  })
  .refine(
    (data) =>
      data.expectedBill >= data.expectedRange.low &&
      data.expectedBill <= data.expectedRange.high,
    {
      message: 'Expected bill must fall within the expected range',
    }
  );

export type ForecastSnapshot = z.infer<typeof ForecastSnapshotSchema>;
export type ForecastMissEvaluation = z.infer<
  typeof ForecastMissEvaluationSchema
>;
