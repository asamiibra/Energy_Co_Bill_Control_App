import { z } from 'zod';

export const SafetyDecisionSchema = z.object({
  policyDecisionId: z.string(),
  status: z.enum(['allow', 'suppress']),
  reasonCode: z.enum([
    'none',
    'essential_use_protection',
    'insufficient_data',
    'unsupported_action',
    'limited_but_actionable',
    'cold_start_limited_actions',
    'transparent_recovery',
  ]),
  source: z.enum([
    'customer_declared',
    'policy_rule',
    'scenario_fixture',
    'usefulness_evaluation',
    'new_customer_policy',
    'forecast_miss_policy',
  ]),
  customerMessage: z.string().optional(),
  supportOptions: z.array(z.string()),
});

export type SafetyDecision = z.infer<typeof SafetyDecisionSchema>;
