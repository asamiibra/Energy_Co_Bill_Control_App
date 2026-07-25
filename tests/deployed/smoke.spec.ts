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

const browserEngineWarnings = [
  'window.styleMedia is a deprecated draft version of window.matchMedia API',
];

for (const [scenario, expectedText] of routes) {
  test(`${scenario} deployed route loads and refreshes`, async ({ page }) => {
    const runtimeProblems: string[] = [];
    page.on('console', (message) => {
      if (
        (message.type() === 'error' || message.type() === 'warning') &&
        !browserEngineWarnings.some((warning) =>
          message.text().includes(warning)
        )
      ) {
        runtimeProblems.push(message.text());
      }
    });
    page.on('pageerror', (error) => runtimeProblems.push(error.message));

    const response = await page.goto(
      `/?scenario=${scenario}&presentation=true`
    );
    expect(response?.ok()).toBe(true);
    await expect(page).toHaveTitle(/Bill Control/);
    await expect(
      page.getByText(
        /Illustrative prototype for the 12-week MVP pilot using synthetic customer and energy data/
      )
    ).toBeVisible();
    await expect(
      page.getByText(expectedText, { exact: false }).first()
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByText(expectedText, { exact: false }).first()
    ).toBeVisible();
    expect(runtimeProblems).toEqual([]);
  });
}

test('deployed P0 actions remain read-only and resettable', async ({
  page,
}) => {
  await page.goto('/?scenario=baseline&presentation=true');
  await expect(
    page.getByText(
      'Bill Control will not change your thermostat, tariff, or account.',
      { exact: false }
    )
  ).toBeVisible();
  await page.getByRole('button', { name: 'Save this action' }).click();
  await page.getByRole('button', { name: 'Save Action Plan' }).click();
  await expect(
    page.getByText('no automatic changes', { exact: false })
  ).toBeVisible();

  await page.keyboard.press('Shift+D');
  await expect(page.getByText('90-Second Demo Path')).toBeVisible();
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reset prototype' }).click();
  await expect(page).toHaveURL(/scenario=baseline/);
});

test('deployed resilience interactions work', async ({ page }) => {
  await page.goto('/?scenario=cold-start&presentation=true');
  await page.getByRole('button', { name: 'Add details' }).click();
  await page
    .getByRole('button', { name: 'Refine estimate with sample answers' })
    .click();
  await expect(
    page.getByText('Estimate Refined', { exact: true })
  ).toBeVisible();
  await expect(page.getByText('$142–$205')).toBeVisible();

  await page.goto('/?scenario=forecast-miss&presentation=true');
  await page
    .getByRole('button', { name: /acknowledge/i })
    .last()
    .click();
  await expect(page.getByText(/acknowledged/i).last()).toBeVisible();

  await page.goto('/?scenario=consent&presentation=true');
  await page.getByRole('button', { name: 'Show more' }).first().click();
  await page.getByRole('button', { name: 'Revoke permission' }).first().click();
  await expect(page.getByRole('status')).toBeVisible();
});

test('deployed unknown state is controlled', async ({ page }) => {
  const response = await page.goto('/?scenario=unknown');
  expect(response?.ok()).toBe(true);
  await expect(
    page.getByRole('heading', { name: 'Scenario Not Found' })
  ).toBeVisible();
});
