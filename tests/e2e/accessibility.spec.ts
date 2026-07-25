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

test('@a11y interactive overlays have no automated violations', async ({
  page,
}) => {
  await page.goto('/?scenario=baseline&presentation=true');
  await page.getByRole('button', { name: 'Save this action' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');

  await page.keyboard.press('Shift+D');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page
    .getByRole('button', { name: 'Open interviewer audit viewer' })
    .click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('@a11y expanded consent state has no automated violations', async ({
  page,
}) => {
  await page.goto('/?scenario=consent&presentation=true');
  await page.getByRole('button', { name: 'Show more' }).first().click();
  await page
    .getByRole('button', { name: /permission/ })
    .first()
    .click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('@a11y safety support dialogs have no automated violations', async ({
  page,
}) => {
  await page.goto('/?scenario=safety&presentation=true');
  await page
    .getByRole('button', { name: 'Explore budget-plan support' })
    .click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Speak with an advisor' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
