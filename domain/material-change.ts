import { z } from 'zod';

export const MaterialChangeConfigSchema = z.object({
  absolutePointChangeDollars: z.number(),
  relativePointChangePercent: z.number(),
  rangeWidthIncreasePercent: z.number(),
  alertOnDataQualityDegradation: z.boolean(),
  alertWhenRecommendationChanges: z.boolean(),
  alertWhenSafetyStateChanges: z.boolean(),
});

export type MaterialChangeConfig = z.infer<typeof MaterialChangeConfigSchema>;

export const MaterialChangeEvaluationSchema = z.object({
  isAlert: z.boolean(),
  triggeredReasons: z.array(
    z.enum([
      'point_estimate_movement',
      'range_width_increase',
      'data_quality_degradation',
      'recommendation_changed',
      'safety_state_changed',
    ])
  ),
  details: z.object({
    absoluteChange: z.number().optional(),
    relativeChange: z.number().optional(),
    previousRangeWidth: z.number().optional(),
    revisedRangeWidth: z.number().optional(),
    rangeWidthIncreasePercent: z.number().optional(),
    absoluteThresholdMet: z.boolean(),
    relativeThresholdMet: z.boolean(),
  }),
});

export type MaterialChangeEvaluation = z.infer<
  typeof MaterialChangeEvaluationSchema
>;

// Prototype default configuration
export const DEFAULT_MATERIAL_CHANGE_CONFIG: MaterialChangeConfig = {
  absolutePointChangeDollars: 15,
  relativePointChangePercent: 0.08,
  rangeWidthIncreasePercent: 0.25,
  alertOnDataQualityDegradation: true,
  alertWhenRecommendationChanges: true,
  alertWhenSafetyStateChanges: true,
};
