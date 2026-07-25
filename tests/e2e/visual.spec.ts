import { expect, test } from '@playwright/test';

const states = ['baseline', 'alert', 'safety'] as const;
const viewports = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '390x844', width: 390, height: 844 },
] as const;

test.describe('@visual P0 visual integrity', () => {
  test.skip(({ browserName }) => browserName !== 'chromium');

  for (const scenario of states) {
    for (const viewport of viewports) {
      test(`${scenario} at ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(`/?scenario=${scenario}`);
        await page
          .getByRole('button', { name: 'Skip to Forecast Details' })
          .click();
        await expect(page).toHaveScreenshot(
          `${scenario}-${viewport.name}.png`,
          {
            animations: 'disabled',
            fullPage: true,
          }
        );
      });
    }
  }
});

test.describe('@visual release artifact integrity', () => {
  test.skip(({ browserName }) => browserName !== 'chromium');

  const releaseStates = [
    {
      scenario: 'baseline',
      expected: [
        'Your bill is currently expected to be $178.',
        '$128.36',
        '$171–$204',
      ],
    },
    {
      scenario: 'alert',
      expected: ['Your estimate changed', '$164', '$186', '$168–$204'],
    },
    {
      scenario: 'safety',
      expected: [
        'Essential-use protection active',
        'Jordan Lee',
        'We are not recommending changes to essential heating under current conditions.',
      ],
    },
  ] as const;

  for (const state of releaseStates) {
    test(`${state.scenario} deck frame`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/?scenario=${state.scenario}&presentation=true`);
      await expect(
        page.getByText('Bill Control', { exact: true }).first()
      ).toBeVisible();
      await expect(
        page.getByText(/synthetic customer and energy data/)
      ).toBeVisible();
      await expect(page.locator('[data-demo-utility]:visible')).toHaveCount(0);
      for (const value of state.expected) {
        await expect(
          page.getByText(value, { exact: false }).first()
        ).toBeVisible();
      }
      await expect(page).toHaveScreenshot(
        `release-${state.scenario}-deck.png`,
        {
          animations: 'disabled',
          fullPage: false,
        }
      );
    });
  }
});
