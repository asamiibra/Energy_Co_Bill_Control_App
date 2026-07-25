import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const scenarios = [
  'baseline',
  'alert',
  'safety',
  'limited-data',
  'cold-start',
  'forecast-miss',
  'consent',
  'tariff-preview',
  'connected-home-preview',
];

for (const scenario of scenarios) {
  test(`@a11y ${scenario} has no automated accessibility violations`, async ({
    page,
  }) => {
    await page.goto(`/?scenario=${scenario}`);
    await page
      .getByRole('button', { name: 'Skip to Forecast Details' })
      .click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
