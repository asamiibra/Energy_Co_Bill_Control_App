import { z } from 'zod';

export const ForecastSurpriseEvaluationSchema = z.object({
  forecastSurprise: z.boolean(),
  eligible: z.boolean(),
  reason: z.string(),
  details: z
    .object({
      finalBill: z.number(),
      rangeUsed: z.object({
        low: z.number(),
        high: z.number(),
      }),
      forecastVersionId: z.string(),
      missType: z.enum(['upper', 'lower', 'none']),
      daysBetweenCommunicationAndClose: z.number(),
      missAmountBeyondRange: z.number().nonnegative(),
    })
    .optional(),
});

export type ForecastSurpriseEvaluation = z.infer<
  typeof ForecastSurpriseEvaluationSchema
>;
