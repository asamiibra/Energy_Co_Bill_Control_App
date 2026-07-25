import { z } from 'zod';

export const BenefitEstimateSchema = z.object({
  low: z.number(),
  high: z.number(),
  currency: z.literal('USD'),
  basis: z.string(),
  assumptions: z.array(z.string()).min(1),
  confidenceLabel: z.enum(['directional', 'moderate']),
});

export type BenefitEstimate = z.infer<typeof BenefitEstimateSchema>;

export const RecommendationSchema = z
  .object({
    recommendationId: z.string(),
    title: z.string(),
    description: z.string(),
    mode: z.enum([
      'self_directed',
      'advisor_assisted',
      'future_governed_action',
    ]),
    benefit: BenefitEstimateSchema.optional(),
    effort: z.enum(['low', 'medium', 'high']),
    reversible: z.boolean(),
    status: z.enum(['available', 'suppressed', 'unavailable', 'future']),
    policyDecisionId: z.string().optional(),
    // New fields for resilience states
    requiredConsentPurposes: z.array(z.string()).optional(),
    usefulnessThreshold: z
      .enum(['fully_actionable', 'limited_but_actionable', 'not_actionable'])
      .optional(),
    requiresColdStartRefinement: z.boolean().optional(),
    benefitNotApplicableReason: z.string().min(1).optional(),
  })
  .refine(
    (data) => {
      // Suppressed recommendations must not show benefits
      if (data.status === 'suppressed') {
        return data.benefit === undefined;
      }
      return true;
    },
    {
      message: 'Suppressed recommendations must not have benefit estimates',
    }
  )
  .refine(
    (data) => {
      // Available recommendations should have benefits (except advisor-assisted)
      if (data.status === 'available' && data.mode !== 'advisor_assisted') {
        return (
          data.benefit !== undefined ||
          data.benefitNotApplicableReason !== undefined
        );
      }
      return true;
    },
    {
      message:
        'Available non-advisor recommendations require a benefit estimate or a typed not-applicable reason',
    }
  );

export type Recommendation = z.infer<typeof RecommendationSchema>;
