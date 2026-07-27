import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('P1 Limited-Data Mode corrections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?scenario=limited-data&presentation=true');
  });

  test('shows canonical limited-data forecast and explicit provenance', async ({
    page,
  }) => {
    await expect(page.getByText('Limited data', { exact: true })).toHaveCount(
      1
    );
    await expect(
      page.getByText(
        'Recent interval-meter data is unavailable. Bill Control is using prior billing history, current weather and your tariff, so the expected range is wider and recommendations are less personalized.'
      )
    ).toBeVisible();
    await expect(page.getByText('$176', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Expected range: $153–$211')).toBeVisible();
    await expect(page.getByText('9 days remaining')).toBeVisible();
    await expect(
      page.getByText('Forecast version: FCST-ALEX-LIMITED-20260918-01', {
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.getByText('Updated Sep 18 at 8:00 AM', { exact: true }).first()
    ).toBeVisible();
    await expect(
      page.getByText('Estimated charges to date', { exact: true })
    ).toBeVisible();
    await expect(page.getByText('$112–$132', { exact: true })).toBeVisible();
    await expect(page.getByText('$121.40', { exact: true })).toHaveCount(0);
    await expect(page.getByText(/Charges posted to date/)).toHaveCount(0);
  });

  test('discloses degraded personalization and a general low-risk option', async ({
    page,
  }) => {
    await expect(
      page.getByText(
        'Without recent interval-meter data, Bill Control cannot observe current daily or hourly usage patterns. The forecast therefore relies more heavily on this household’s prior comparable billing periods, weather and tariff information. This creates a wider expected range to reflect the increased uncertainty.'
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        'Because recent usage detail is unavailable, Bill Control is showing a general low-risk option rather than a personalized recommendation.'
      )
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'Consider reviewing your cooling schedule',
      })
    ).toBeVisible();
    await expect(
      page.getByText(
        'A small, self-directed cooling adjustment may reduce costs during the remaining nine days, depending on household needs and weather.'
      )
    ).toBeVisible();
    await expect(
      page.getByText('Directional estimated bill reduction: $5–$15')
    ).toBeVisible();
    await expect(
      page.getByText(
        'This estimate is directional because recent interval usage is unavailable. Actual impact is not guaranteed.'
      )
    ).toBeVisible();

    await page.getByText('Technical details', { exact: true }).click();
    const technicalDetails = page
      .getByText('Technical details', { exact: true })
      .locator('..');
    await expect(technicalDetails).toContainText('Data-quality tierLimited');
    await expect(technicalDetails).toContainText(
      'Recommendation classGeneral low-risk option'
    );
    await expect(technicalDetails).toContainText(
      'Personalization statusReduced'
    );
    await expect(technicalDetails).toContainText('Action executionNone');
  });

  test('supports keyboard disclosures, browser-local state, reset, and accessibility', async ({
    page,
  }) => {
    const driver = page.getByRole('button', { name: /Billing history/ });
    await driver.focus();
    await page.keyboard.press('Enter');
    await expect(driver).toHaveAttribute('aria-expanded', 'true');
    await expect(driver).toHaveAttribute(
      'aria-controls',
      'limited-driver-panel-driver-billing-history-001'
    );

    await page.getByRole('button', { name: 'Set reminder' }).click();
    await expect(page.getByRole('status')).toContainText(
      'Reminder saved in this browser only'
    );
    const reminders = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('bill-control-local-reminders') || '[]')
    );
    expect(reminders).toHaveLength(1);
    expect(reminders[0]).toMatchObject({
      scenarioId: 'limited_data_alex_monthly_read',
    });

    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Reset demo' }).click();
    await expect(page).toHaveURL('/?scenario=baseline&presentation=true');
    await expect
      .poll(() =>
        page.evaluate(() =>
          localStorage.getItem('bill-control-local-reminders')
        )
      )
      .toBeNull();
  });
});

test.describe('P1 New-Customer Cold Start corrections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?scenario=cold-start&presentation=true');
  });

  test('shows canonical cold-start values and cohort privacy boundaries', async ({
    page,
  }) => {
    await expect(
      page.getByText('New customer · limited history', { exact: true })
    ).toHaveCount(1);
    await expect(
      page.getByText('Taylor Brooks', { exact: true })
    ).toBeVisible();
    await expect(page.getByText('$165', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Expected range: $125–$218')).toBeVisible();
    await expect(page.getByText('20 days remaining')).toBeVisible();
    await expect(
      page.getByText('Forecast version: FCST-TAYLOR-COHORT-20260715-01', {
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.getByText('Updated Jul 15 at 10:30 AM', { exact: true }).first()
    ).toBeVisible();
    await expect(
      page.getByText(
        'The range may narrow as Energy Co observes more of this household’s usage history.'
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        'Expected range — wider because household history is limited'
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        'Comparison basis: Aggregated usage patterns from similar townhomes in the same climate and tariff context.'
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        'No individual neighbor’s usage is shown or used as a direct comparison.'
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        'Estimate based on aggregated July usage patterns for a sufficiently sized comparison group with similar dwelling, climate and tariff characteristics.'
      )
    ).toBeVisible();
    await expect(
      page.getByText('Current tariff', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(
        'Taylor’s current Standard Residential tariff is applied to the comparison-group usage pattern.'
      )
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'What’s influencing your estimate',
      })
    ).toBeVisible();
    expect(await page.locator('body').textContent()).not.toContain('&apos;');
    await expect(page.getByText(/estimated bill reduction/i)).toHaveCount(0);
  });

  test('uses the deterministic refinement and supports continuing without answers', async ({
    page,
  }) => {
    const toggle = page.locator(
      '[data-interaction-id="cold-start-toggle-details"]'
    );
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByText(
        'In this prototype, sample answers remain in the browser and are used only to demonstrate comparison-group refinement. No account profile is updated.'
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        'Skipping these questions does not affect account service or eligibility.'
      )
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Continue without answering' })
      .click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await page
      .getByRole('button', {
        name: 'Refine estimate with sample answers',
      })
      .click();
    await expect(page.getByRole('status')).toContainText(
      'Estimate refined in this prototype using sample answers. No account profile or consent setting was changed.'
    );
    await expect(page.getByText('Initial Range')).toBeVisible();
    await expect(page.getByText('$125–$218', { exact: true })).toBeVisible();
    await expect(page.getByText('Refined Range')).toBeVisible();
    await expect(
      page.getByText('$142–$205', { exact: true }).first()
    ).toBeVisible();
    await expect(page.getByText('Household size: 3 people')).toBeVisible();
    await expect(page.getByText('Heating type: Heat pump')).toBeVisible();
    await expect(page.getByText('Electric vehicle: Yes')).toBeVisible();
    await expect(page.getByText('Smart thermostat: Yes')).toBeVisible();
    await expect(
      page.getByText('Forecast version: FCST-TAYLOR-REFINED-20260715-02', {
        exact: true,
      })
    ).toBeVisible();
  });

  test('keeps alert preference local, resets state, and remains accessible', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'Save prototype alert preference' })
      .click();
    await expect(page.getByRole('status')).toHaveText(
      'Alert preference saved in this browser only. No account setting changed and no notification will be sent.'
    );
    const reminders = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('bill-control-local-reminders') || '[]')
    );
    expect(reminders).toHaveLength(1);
    expect(reminders[0]).toMatchObject({
      scenarioId: 'cold_start_taylor_new_customer',
    });

    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await page.getByRole('button', { name: 'Add details' }).click();
    await page
      .getByRole('button', {
        name: 'Refine estimate with sample answers',
      })
      .click();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Reset demo' }).click();
    await expect(page).toHaveURL('/?scenario=baseline&presentation=true');
    await expect
      .poll(() =>
        page.evaluate(() =>
          localStorage.getItem('bill-control-local-reminders')
        )
      )
      .toBeNull();

    await page.goto('/?scenario=cold-start&presentation=true');
    await expect(
      page.getByText('Early estimate based on similar homes')
    ).toBeVisible();
    await expect(page.getByText('Estimate Refined')).toHaveCount(0);
  });
});
