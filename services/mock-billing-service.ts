import type { HouseholdProfile } from '@/domain/household';
import type { DemoScenario } from '@/domain/scenario';

/**
 * Mock Billing Service
 *
 * Owns:
 * - Bill to date
 * - Billing-period dates  
 * - Tariff identifier
 * - Account-plan information
 * - Historical bill fixtures
 */

export interface BillingServiceData {
  billToDate: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  tariffName: string;
  accountPlan?: string;
  monthlyBudget?: number;
  renewalDate?: string;
}

export class MockBillingService {
  /**
   * Get billing information for a scenario
   */
  getBillingData(scenario: DemoScenario): BillingServiceData {
    return {
      billToDate: scenario.forecast.billToDate,
      billingPeriodStart: scenario.forecast.billingPeriodStart,
      billingPeriodEnd: scenario.forecast.billingPeriodEnd,
      tariffName: scenario.household.tariffName,
      accountPlan: 'Standard',
      monthlyBudget: scenario.household.monthlyBudget,
      renewalDate: scenario.household.renewalDate,
    };
  }

  /**
   * Get household profile
   */
  getHouseholdProfile(scenario: DemoScenario): HouseholdProfile {
    return scenario.household;
  }

  /**
   * Get historical bills (synthetic data)
   */
  getHistoricalBills(customerId: string): Array<{
    billingPeriodEnd: string;
    amount: number;
    daysInPeriod: number;
  }> {
    // Return synthetic historical data based on customer ID
    if (customerId === 'CUST-ALEX-001') {
      return [
        { billingPeriodEnd: '2026-06-02', amount: 142.33, daysInPeriod: 31 },
        { billingPeriodEnd: '2026-05-02', amount: 118.75, daysInPeriod: 30 },
        { billingPeriodEnd: '2026-04-02', amount: 95.42, daysInPeriod: 31 },
      ];
    }

    if (customerId === 'CUST-JORDAN-001') {
      return [
        { billingPeriodEnd: '2025-12-05', amount: 198.67, daysInPeriod: 31 },
        { billingPeriodEnd: '2025-11-05', amount: 156.23, daysInPeriod: 30 },
        { billingPeriodEnd: '2025-10-05', amount: 134.89, daysInPeriod: 31 },
      ];
    }

    return [];
  }
}

export const mockBillingService = new MockBillingService();
