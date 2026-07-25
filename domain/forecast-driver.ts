import { z } from 'zod';

export const ForecastDriverSchema = z.object({
  id: z.string(),
  title: z.string(),
  direction: z.enum(['up', 'down', 'neutral']),
  contributionRange: z
    .object({
      low: z.number(),
      high: z.number(),
    })
    .optional(),
  explanation: z.string(),
  source: z.enum([
    'meter',
    'weather',
    'tariff',
    'billing-history',
    'cohort-analysis',
    'refined-cohort-analysis',
    'equipment-cohort',
    'weather-post-analysis',
    'meter-post-analysis',
  ]),
  asOf: z.string(),
});

export type ForecastDriver = z.infer<typeof ForecastDriverSchema>;
