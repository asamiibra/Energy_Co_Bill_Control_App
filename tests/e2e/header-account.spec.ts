import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('header account menu', () => {
  test('is compact, keyboard complete, and route-aware on desktop', async ({
    page,
  }) => {
    await page.goto('/?scenario=baseline&presentation=true');
    const trigger = page.getByRole('button', { name: 'Account Menu' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    const menu = page.getByRole('menu', { name: 'Account menu' });
    await expect(menu).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByRole('menuitem', { name: 'Account summary' })
    ).toBeFocused();
    await expect(menu).toContainText('Alex Morgan');
    await expect(menu).toContainText('1847 Cedar Lane');

    const menuBox = await menu.boundingBox();
    const navigationBox = await page
      .getByRole('navigation', { name: 'Guided demo navigation' })
      .boundingBox();
    expect(menuBox).not.toBeNull();
    expect(navigationBox).not.toBeNull();
    expect(menuBox!.width).toBeLessThanOrEqual(304);
    expect(menuBox!.y + menuBox!.height).toBeLessThanOrEqual(navigationBox!.y);

    await page.getByRole('menuitem', { name: 'Account summary' }).click();
    await expect(menu).toContainText('Current plan:');
    await expect(menu).toContainText('illustrative and read-only');

    await page.getByRole('menuitem', { name: 'Help and support' }).click();
    await expect(
      page.getByRole('heading', { name: 'Bill Control help' })
    ).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('heading', { name: 'Bill Control help' })
    ).toHaveCount(0);

    await trigger.click();
    await page
      .getByRole('menuitem', { name: 'Consent and preferences' })
      .click();
    await expect(page).toHaveURL(/scenario=consent&presentation=true/);
    await expect(menu).toHaveCount(0);
  });

  test('toggles, restores focus, closes outside, and fits mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?scenario=baseline&presentation=true');
    const trigger = page.getByRole('button', { name: 'Account Menu' });
    const menu = page.getByRole('menu', { name: 'Account menu' });

    await trigger.click();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);

    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    await trigger.click();
    await expect(menu).toHaveCount(0);

    await trigger.click();
    await page.getByLabel('Prototype disclosure').click();
    await expect(menu).toHaveCount(0);
  });
});

test('navigation and alert semantics remain singular', async ({ page }) => {
  await page.goto('/?scenario=alert&presentation=true');
  await expect(
    page.getByRole('link', { name: 'Back to demo overview' })
  ).toHaveCount(1);
  await expect(page.getByText('$186', { exact: true })).toHaveCount(2);
  await expect(
    page.getByText('Expected range: $168–$204', { exact: true }).first()
  ).toBeVisible();
  await expect(page.getByText(/Generated:/).last()).toBeVisible();

  await page.goto('/?scenario=alert');
  await expect(page.getByText('Back to demo overview')).toHaveCount(0);
});

test('demo overview marks the primary starting scenario', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Start here', { exact: true })).toHaveCount(1);
});
