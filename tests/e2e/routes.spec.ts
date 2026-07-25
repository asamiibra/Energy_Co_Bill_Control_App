import { expect, test } from '@playwright/test';

const routes = [
  ['baseline', 'Your bill is currently expected to be $178.'],
  ['alert', 'Your estimate changed'],
  ['safety', 'Essential Use Protection Active'],
  ['limited-data', 'Limited-Data Estimate'],
  ['cold-start', 'Welcome to Bill Control'],
  [
    'forecast-miss',
    'Your final bill was outside the range we previously showed',
  ],
  ['consent', 'Consent and Preferences'],
  ['tariff-preview', 'Tariff-Fit Preview'],
  ['connected-home-preview', 'Connected-Home Preview'],
] as const;

test.describe('route and runtime quality', () => {
  for (const [scenario, expectedText] of routes) {
    test(`${scenario} supports direct navigation and refresh`, async ({
      page,
    }) => {
      const consoleProblems: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning') {
          consoleProblems.push(message.text());
        }
      });
      page.on('pageerror', (error) => consoleProblems.push(error.message));

      await page.goto(`/?scenario=${scenario}`);
      await expect(
        page.getByText(/synthetic customer and energy data/)
      ).toBeVisible();
      await page
        .getByRole('button', { name: 'Skip to Forecast Details' })
        .click();
      await expect(
        page.getByText(expectedText, { exact: false }).first()
      ).toBeVisible();
      await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');

      const scenarioId = await page.evaluate(() => {
        const stored = localStorage.getItem('bill-control-audit-events');
        const events = stored ? JSON.parse(stored) : [];
        return events.at(-1)?.scenarioId;
      });
      expect(scenarioId).toBeTruthy();

      await page.reload();
      await expect(
        page.getByRole('button', { name: 'Skip to Forecast Details' })
      ).toBeVisible();
      expect(consoleProblems).toEqual([]);
    });
  }

  test('unknown scenario fails safely without a blank state', async ({
    page,
  }) => {
    await page.goto('/?scenario=does-not-exist');
    await expect(
      page.getByRole('heading', { name: 'Scenario Not Found' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Go to Baseline Forecast' })
    ).toBeVisible();
  });

  test('back and forward navigation stay synchronized', async ({ page }) => {
    await page.goto('/?scenario=baseline');
    await page.goto('/?scenario=alert');
    await page.goBack();
    await expect(page).toHaveURL(/scenario=baseline/);
    await page.goForward();
    await expect(page).toHaveURL(/scenario=alert/);
  });
});

test.describe('customer action boundaries', () => {
  test('baseline saves local intent without execution', async ({ page }) => {
    await page.goto('/?scenario=baseline');
    await page
      .getByRole('button', { name: 'Skip to Forecast Details' })
      .click();
    await page.getByRole('button', { name: 'Save this action' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Save Action Plan' }).click();
    await expect(
      page.getByText('no automatic changes', { exact: false })
    ).toBeVisible();

    const saved = await page.evaluate(() =>
      localStorage.getItem('bill-control-saved-plans')
    );
    expect(saved).toContain('rec-cooling-adjust-001');
  });

  test('alert save, modify, decline, and advisor paths remain local', async ({
    page,
  }) => {
    await page.goto('/?scenario=alert');
    await page
      .getByRole('button', { name: 'Skip to Forecast Details' })
      .click();
    await page.getByLabel('Select Adjust cooling schedule').check();
    await page.getByRole('button', { name: 'Save selected actions' }).click();
    await expect(page.getByRole('status')).toContainText(
      'No external action occurred'
    );
    await page.getByRole('button', { name: 'Modify' }).click();
    await expect(page.getByRole('status')).toContainText('modify locally');
    await page.getByRole('button', { name: 'Not now' }).click();
    await expect(page.getByRole('status')).toContainText(
      'No changes were made'
    );
    await page.getByRole('button', { name: 'Talk with an advisor' }).click();
    await expect(page.getByRole('status')).toContainText(
      'No real case was created'
    );
  });

  test('safety and previews expose no executable action', async ({ page }) => {
    await page.goto('/?scenario=safety');
    await page
      .getByRole('button', { name: 'Skip to Forecast Details' })
      .click();
    const suppressed = page.getByText('Reduce essential heating overnight');
    await expect(suppressed).toBeVisible();
    await expect(suppressed.locator('..')).not.toContainText('$');

    await page.goto('/?scenario=tariff-preview');
    await page
      .getByRole('button', { name: 'Skip to Forecast Details' })
      .click();
    await expect(page.getByText('Not available in the MVP.')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /switch tariff|confirm switch/i })
    ).toHaveCount(0);
  });
});
