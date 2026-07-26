import { z } from 'zod';

export const PrototypeEventSchema = z.object({
  eventId: z.string(),
  sessionId: z.string(),
  scenarioId: z.string(),
  householdId: z.string(),
  traceId: z.string(),
  forecastVersionId: z.string().optional(),
  recommendationId: z.string().optional(),
  policyDecisionId: z.string().optional(),
  consentVersionId: z.string().optional(),
  eventName: z.string(),
  occurredAt: z.string(),
  properties: z.record(z.unknown()),
});

export type PrototypeEvent = z.infer<typeof PrototypeEventSchema>;

// Event names as constants
export const EVENT_NAMES = {
  SCENARIO_LOADED: 'scenario_loaded',
  // Exposure events
  MESSAGE_PREVIEW_OPENED: 'message_preview_opened',
  MESSAGE_LINK_SELECTED: 'message_link_selected',
  FORECAST_VIEWED: 'forecast_viewed',
  ALERT_VIEWED: 'alert_viewed',
  SAFETY_STATE_VIEWED: 'safety_state_viewed',

  // Comprehension events
  FORECAST_RANGE_VIEWED: 'forecast_range_viewed',
  RANGE_EXPLANATION_OPENED: 'range_explanation_opened',
  DRIVER_EXPLANATION_OPENED: 'driver_explanation_opened',
  WHY_CHANGED_OPENED: 'why_changed_opened',
  COMPREHENSION_RESPONSE_RECORDED: 'comprehension_response_recorded',
  BASELINE_SECTION_NAVIGATED: 'baseline_section_navigated',

  // Action events
  RECOMMENDATION_SELECTED: 'recommendation_selected',
  ACTION_PLAN_SAVED: 'action_plan_saved',
  ACTION_PLAN_MODIFIED: 'action_plan_modified',
  ACTION_PLAN_DECLINED: 'action_plan_declined',
  REMINDER_SET: 'reminder_set',
  ADVISOR_REQUESTED: 'advisor_requested',
  SUPPORT_OPTION_SELECTED: 'support_option_selected',

  // Consent events
  CONSENT_PERMISSION_VIEWED: 'consent_permission_viewed',
  CONSENT_GRANTED: 'consent_granted',
  CONSENT_DECLINED: 'consent_declined',
  CONSENT_REVOKED: 'consent_revoked',
  CONSENT_RESTORED: 'consent_restored',

  // Forecast events
  FORECAST_GENERATED: 'forecast_generated',
  FORECAST_REVISED: 'forecast_revised',
  MATERIAL_CHANGE_ALERT_TRIGGERED: 'material_change_alert_triggered',
  FORECAST_MISS_ACKNOWLEDGED: 'forecast_miss_acknowledged',
  FORECAST_SURPRISE_RECORDED: 'forecast_surprise_recorded',
  DATA_QUALITY_TIER_CHANGED: 'data_quality_tier_changed',
  EXPLANATION_FAITHFULNESS_FAILED: 'explanation_faithfulness_failed',

  // Safety events
  RECOMMENDATION_SUPPRESSED: 'recommendation_suppressed',
  SAFETY_REASON_VIEWED: 'safety_reason_viewed',
  SAFE_ALTERNATIVE_SELECTED: 'safe_alternative_selected',

  // Outcome events
  ACTION_SELF_REPORTED_COMPLETED: 'action_self_reported_completed',
  FINAL_BILL_RECORDED: 'final_bill_recorded',
  BILL_INSIDE_RANGE: 'bill_inside_range',
  BILL_OUTSIDE_RANGE: 'bill_outside_range',
  VERIFIED_BENEFIT_RECORDED: 'verified_benefit_recorded',
  COMPLAINT_RECORDED: 'complaint_recorded',
  SUPPORT_CONTACT_RECORDED: 'support_contact_recorded',
  TARIFF_PREVIEW_VIEWED: 'tariff_preview_viewed',
  CONNECTED_HOME_PREVIEW_VIEWED: 'connected_home_preview_viewed',
  PERSONALIZED_TARIFF_PREVIEW_SUPPRESSED:
    'personalized_tariff_preview_suppressed',
  PERSONALIZED_DEVICE_RECOMMENDATION_SUPPRESSED:
    'personalized_device_recommendation_suppressed',
} as const;
