import { z } from 'zod';

export const ConsentPermissionSchema = z.object({
  purpose: z.enum([
    'interval_meter_personalization',
    'connected_device_access',
    'tariff_recommendation',
    'partner_referral',
    'bill_alert_reminders',
    'advisor_follow_up',
  ]),
  status: z.enum(['granted', 'declined', 'not_requested', 'revoked']),
  grantedAt: z.string().optional(),
  revokedAt: z.string().optional(),
  declinedAt: z.string().optional(),
  // New fields for detailed consent management
  description: z.string().optional(),
  dataUsed: z.string().optional(),
  benefit: z.string().optional(),
  required: z.boolean().optional(),
  revokeImpact: z.string().optional(),
  previousStatus: z
    .enum(['granted', 'declined', 'not_requested', 'revoked'])
    .optional(),
  restoredAt: z.string().optional(),
});

export const ConsentStateSchema = z.object({
  consentVersionId: z.string(),
  updatedAt: z.string().optional(),
  permissions: z.array(ConsentPermissionSchema),
});

export type ConsentState = z.infer<typeof ConsentStateSchema>;
export type ConsentPermission = z.infer<typeof ConsentPermissionSchema>;
