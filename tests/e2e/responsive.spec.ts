import { expect, test } from '@playwright/test';

const states = [
  'baseline',
  'alert',
  'safety',
  'limited-data',
  'cold-start',
  'forecast-miss',
  'consent',
  'tariff-preview',
  'connected-home-preview',
] as const;

const viewports = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '390x844', width: 390, height: 844 },
  { name: '375x667', width: 375, height: 667 },
  { name: '430x932', width: 430, height: 932 },
  { name: '320x568', width: 320, height: 568 },
] as const;

test.describe('responsive state integrity', () => {
  for (const scenario of states) {
    for (const viewport of viewports) {
      test(`${scenario} has no horizontal overflow at ${viewport.name}`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.goto(`/?scenario=${scenario}`);
        await page
          .getByRole('button', { name: 'Skip to Forecast Details' })
          .click();

        await expect(
          page.getByText(/synthetic customer and energy data/)
        ).toBeVisible();

        const dimensions = await page.evaluate(() => ({
          body: document.body.scrollWidth,
          document: document.documentElement.scrollWidth,
          viewport: document.documentElement.clientWidth,
        }));

        expect(
          dimensions.body,
          `${scenario} body width at ${viewport.name}`
        ).toBeLessThanOrEqual(dimensions.viewport + 1);
        expect(
          dimensions.document,
          `${scenario} document width at ${viewport.name}`
        ).toBeLessThanOrEqual(dimensions.viewport + 1);
      });
    }
  }
});
