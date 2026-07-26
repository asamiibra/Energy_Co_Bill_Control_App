import { expect, test } from '@playwright/test';

test.describe('release presentation controls', () => {
  test('presentation mode preserves state and is keyboard-driven', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem('bill-control-saved-plans', '[{"stale":true}]');
      localStorage.setItem('unrelated-storage-key', 'preserve-me');
    });

    await page.goto('/?scenario=baseline&presentation=true');

    await expect(
      page.getByText('Your bill is currently expected to be $178.')
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Demo scenario switcher' })
    ).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem('bill-control-saved-plans'))
      )
      .toBe('[{"stale":true}]');
    expect(
      await page.evaluate(() => localStorage.getItem('unrelated-storage-key'))
    ).toBe('preserve-me');

    await page.keyboard.press('2');
    await expect(page).toHaveURL(/scenario=alert.*presentation=true/);
    await expect(page.getByText('Your estimate changed')).toBeVisible();

    await page.keyboard.press('3');
    await expect(page).toHaveURL(/scenario=safety.*presentation=true/);
    await expect(
      page.getByText('Essential-use protection active')
    ).toBeVisible();

    await page.keyboard.press('Shift+D');
    await expect(page.getByText('90-Second Demo Path')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('90-Second Demo Path')).toHaveCount(0);
  });

  test('reset clears only prototype state and returns to baseline', async ({
    page,
  }) => {
    await page.goto('/?scenario=alert&presentation=true');
    await page.evaluate(() => {
      localStorage.setItem('bill-control-local-reminders', 'local');
      localStorage.setItem('unrelated-storage-key', 'preserve-me');
    });

    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Reset demo' }).click();

    await expect(page).toHaveURL(/scenario=baseline&presentation=true/);
    await expect(
      page.getByText('Your bill is currently expected to be $178.')
    ).toBeVisible();
    expect(
      await page.evaluate(() =>
        localStorage.getItem('bill-control-local-reminders')
      )
    ).toBeNull();
    expect(
      await page.evaluate(() => localStorage.getItem('unrelated-storage-key'))
    ).toBe('preserve-me');
  });
});

test.describe('offline-after-load P0 reliability', () => {
  test('bundled P0 states and local actions remain usable offline', async ({
    context,
    page,
  }) => {
    await page.goto('/?scenario=baseline&presentation=true');
    await expect(
      page.getByText('Your bill is currently expected to be $178.')
    ).toBeVisible();
    await expect(page.getByText('1 of 3 — Baseline Forecast')).toBeVisible();

    await context.setOffline(true);

    await page.getByRole('button', { name: 'Save this action' }).click();
    await page.getByRole('button', { name: 'Save Action Plan' }).click();
    await expect(
      page.getByText('no automatic changes', { exact: false })
    ).toBeVisible();

    await page.keyboard.press('2');
    await expect(page.getByText('Your estimate changed')).toBeVisible();
    await expect(
      page.getByText('2 of 3 — Material-Change Alert')
    ).toBeVisible();
    await page.keyboard.press('3');
    await expect(
      page.getByText('Essential-use protection active')
    ).toBeVisible();
    await expect(page.getByText('3 of 3 — Safety Guardrail')).toBeVisible();

    await page.keyboard.press('Shift+D');
    await page
      .getByRole('button', { name: 'Open interviewer audit viewer' })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Interviewer Audit Viewer' })
    ).toBeVisible();
    await page.keyboard.press('Escape');
  });
});
