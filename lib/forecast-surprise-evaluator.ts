import type { ForecastSnapshot } from '@/domain/forecast';
import type { ForecastSurpriseEvaluation } from '@/domain/measurement';
import { daysBetween } from './format-date';

/**
 * Evaluate whether a final actual bill constitutes a forecast surprise.
 *
 * A forecast surprise occurs ONLY when:
 * - The final actual bill is OUTSIDE the last valid customer-communicated range
 * - That range was generated and communicated at least 24 hours before billing close
 * - The range was not withdrawn or superseded by a later communicated range
 * - The customer was eligible for a forecast at that time
 *
 * A final bill EQUAL to either endpoint is INSIDE the range (not a surprise).
 * A mid-cycle revision never increments forecast surprise.
 */
export function evaluateForecastSurprise(
  lastCommunicatedForecast: ForecastSnapshot,
  finalBill: number,
  billingCloseDate: string,
  currentDate?: string
): ForecastSurpriseEvaluation {
  if (
    lastCommunicatedForecast.communicationStatus === 'withdrawn' ||
    lastCommunicatedForecast.communicationStatus === 'superseded'
  ) {
    return {
      forecastSurprise: false,
      eligible: false,
      reason: `Range was ${lastCommunicatedForecast.communicationStatus}`,
    };
  }

  if (lastCommunicatedForecast.eligibleAtCommunication === false) {
    return {
      forecastSurprise: false,
      eligible: false,
      reason: 'Customer was not eligible when the range was communicated',
    };
  }

  // Check if range was communicated at least 24 hours before billing close
  const daysBetweenComAndClose = daysBetween(
    lastCommunicatedForecast.generatedAt,
    billingCloseDate
  );

  if (daysBetweenComAndClose < 1) {
    return {
      forecastSurprise: false,
      eligible: false,
      reason: 'Range communicated less than 24 hours before billing close',
    };
  }

  // Check if billing period has closed (use provided date for testing)
  const now = currentDate ? new Date(currentDate) : new Date();
  const closeDate = new Date(billingCloseDate);
  if (now < closeDate) {
    return {
      forecastSurprise: false,
      eligible: false,
      reason: 'Billing period has not yet closed',
    };
  }

  // Determine if bill is outside range
  // A bill equal to either endpoint is INSIDE the range
  const { low, high } = lastCommunicatedForecast.expectedRange;
  const isOutsideRange = finalBill < low || finalBill > high;

  if (!isOutsideRange) {
    return {
      forecastSurprise: false,
      eligible: true,
      reason: 'Final bill is inside the communicated range',
      details: {
        finalBill,
        rangeUsed: lastCommunicatedForecast.expectedRange,
        forecastVersionId: lastCommunicatedForecast.forecastVersionId,
        missType: 'none',
        daysBetweenCommunicationAndClose: daysBetweenComAndClose,
        missAmountBeyondRange: 0,
      },
    };
  }

  // Determine miss type
  const missType = finalBill < low ? 'lower' : 'upper';

  return {
    forecastSurprise: true,
    eligible: true,
    reason: `Final bill is ${missType === 'upper' ? 'above' : 'below'} the communicated range`,
    details: {
      finalBill,
      rangeUsed: lastCommunicatedForecast.expectedRange,
      forecastVersionId: lastCommunicatedForecast.forecastVersionId,
      missType,
      daysBetweenCommunicationAndClose: daysBetweenComAndClose,
      missAmountBeyondRange:
        missType === 'upper' ? finalBill - high : low - finalBill,
    },
  };
}
