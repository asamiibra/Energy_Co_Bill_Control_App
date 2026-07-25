import { z } from 'zod';

export const HouseholdProfileSchema = z.object({
  customerId: z.string(),
  customerName: z.string(),
  address: z.string(),
  householdSize: z.number().int().positive().optional(), // Optional for cold-start
  homeType: z.enum(['detached', 'townhome', 'apartment']),
  heatingType: z.enum(['electric', 'gas', 'heat-pump']).optional(), // Optional for cold-start
  hasEV: z.boolean().optional(), // Optional for cold-start
  hasSolar: z.boolean().optional(), // Optional for cold-start
  hasBattery: z.boolean().optional(), // Optional for cold-start
  hasSmartThermostat: z.boolean().optional(), // Optional for cold-start
  tariffName: z.string(),
  monthlyBudget: z.number().optional(),
  renewalDate: z.string().optional(),
});

export type HouseholdProfile = z.infer<typeof HouseholdProfileSchema>;
