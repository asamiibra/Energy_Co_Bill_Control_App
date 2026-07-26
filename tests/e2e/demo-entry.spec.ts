import { expect, test } from '@playwright/test';

test.describe('interview demo landing', () => {
  test('renders the fixture-backed primary path and one disclosure', async ({
    page,
  }) => {
    await page.goto('/demo');

    await expect(
      page.getByRole('heading', {
        name: 'Bill Control Interactive Prototype',
      })
    ).toBeVisible();
    await expect(page.getByLabel('Prototype disclosure')).toHaveCount(1);
    await expect(
      page.getByText(
        'Your expected bill is $178, with an expected range of $171–$204. You have 8 days remaining.'
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        'Your expected bill has changed from $164 to $186. Recent cooling use, warmer weather and missing meter data are the main drivers.'
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        'Essential-use protection is active. Bill Control has withheld recommendations that could reduce essential heating.'
      )
    ).toBeVisible();
  });

  test('primary demo links open the correct presentation routes', async ({
    page,
  }) => {
    await page.goto('/demo');
    await page
      .getByRole('link', { name: 'Start the 90-second guided demo' })
      .click();
    await expect(page).toHaveURL(/scenario=baseline&presentation=true/);

    for (const [label, scenario] of [
      ['Open Baseline Forecast', 'baseline'],
      ['Open Material-Change Alert', 'alert'],
      ['Open Safety Guardrail', 'safety'],
    ] as const) {
      await page.goto('/demo');
      await page.getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(
        new RegExp(`scenario=${scenario}&presentation=true`)
      );
    }
  });

  test('secondary groups toggle by keyboard and every route opens', async ({
    page,
  }) => {
    await page.goto('/demo');

    const resilience = page.getByText('MVP resilience states', {
      exact: true,
    });
    await resilience.focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('link', { name: 'Open Limited-Data Mode' })
    ).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('link', { name: 'Open Limited-Data Mode' })
    ).toHaveCount(0);

    const secondaryRoutes = [
      ['Open Limited-Data Mode', 'limited-data'],
      ['Open New-Customer Cold Start', 'cold-start'],
      ['Open Forecast-Miss Recovery', 'forecast-miss'],
      ['Open Consent and Preferences', 'consent'],
      ['Open Tariff-Fit Preview', 'tariff-preview'],
      ['Open Connected-Home Preview', 'connected-home-preview'],
    ] as const;

    for (const [label, scenario] of secondaryRoutes) {
      await page.goto('/demo');
      const group =
        scenario === 'tariff-preview' || scenario === 'connected-home-preview'
          ? 'Future expansion previews'
          : 'MVP resilience states';
      await page.getByText(group, { exact: true }).click();
      await page.getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(
        new RegExp(`scenario=${scenario}&presentation=true`)
      );
    }
  });

  test('landing remains usable at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/demo');
    await expect(
      page.getByRole('link', { name: 'Start the 90-second guided demo' })
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });
});

test.describe('guided presentation navigation', () => {
  test('moves through the P0 sequence with history and refresh', async ({
    page,
  }) => {
    await page.goto('/?scenario=baseline&presentation=true');
    await expect(page.getByText('1 of 3 — Baseline Forecast')).toBeVisible();

    await page
      .getByRole('button', { name: 'Next: Material-Change Alert' })
      .click();
    await expect(page).toHaveURL(/scenario=alert&presentation=true/);
    await expect(
      page.getByText('2 of 3 — Material-Change Alert')
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Previous: Baseline Forecast' })
      .click();
    await expect(page).toHaveURL(/scenario=baseline&presentation=true/);
    await page.goBack();
    await expect(page).toHaveURL(/scenario=alert&presentation=true/);
    await page.goForward();
    await expect(page).toHaveURL(/scenario=baseline&presentation=true/);
    await page.reload();
    await expect(page.getByText('1 of 3 — Baseline Forecast')).toBeVisible();
    await page
      .getByRole('button', { name: 'Next: Material-Change Alert' })
      .click();
    await expect(
      page.getByText('2 of 3 — Material-Change Alert')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Next: Safety Guardrail' }).click();
    await expect(page).toHaveURL(/scenario=safety&presentation=true/);
    await expect(page.getByText('3 of 3 — Safety Guardrail')).toBeVisible();
    await page.getByRole('link', { name: 'Return to demo overview' }).click();
    await expect(page).toHaveURL(/\/demo$/);
  });

  test('reset is explicit and customer and screenshot modes stay clean', async ({
    page,
  }) => {
    await page.goto('/?scenario=alert&presentation=true');
    await page.evaluate(() =>
      localStorage.setItem('bill-control-local-reminders', 'saved')
    );
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Reset demo' }).click();
    await expect(page).toHaveURL(/scenario=baseline&presentation=true/);
    expect(
      await page.evaluate(() =>
        localStorage.getItem('bill-control-local-reminders')
      )
    ).toBeNull();

    await page.goto('/?scenario=baseline');
    await expect(page.getByText(/1 of 3/)).toHaveCount(0);
    await expect(
      page.getByRole('navigation', { name: 'Guided demo navigation' })
    ).toHaveCount(0);
    await expect(page.getByText('90-Second Demo Path')).toHaveCount(0);

    await page.goto('/?scenario=baseline&screenshot=true');
    await expect(page.locator('[data-demo-utility]:visible')).toHaveCount(0);
  });
});

test.describe('baseline next-step and confirmation behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?scenario=baseline');
    await page
      .getByRole('button', { name: 'Skip to Forecast Details' })
      .click();
  });

  test('quick links move keyboard focus and emit local events', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'See what is driving this estimate' })
      .click();
    await expect(
      page
        .getByRole('heading', { name: "What's driving your estimate" })
        .locator('..')
    ).toBeFocused();

    await page.getByRole('button', { name: 'See what you can do' }).focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('heading', { name: 'What you can do' }).locator('..')
    ).toBeFocused();

    const events = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('bill-control-audit-events') || '[]')
    );
    expect(
      events.filter(
        (event: { eventName: string }) =>
          event.eventName === 'baseline_section_navigated'
      )
    ).toHaveLength(2);
  });

  test('technical identifiers stay out of customer chrome but remain auditable', async ({
    page,
  }) => {
    await expect(page.locator('footer')).not.toContainText(
      'FCST-ALEX-20260725-01'
    );
    await expect(page.locator('main')).not.toContainText(
      'Forecast version: FCST-ALEX-20260725-01'
    );

    await page.goto('/?scenario=baseline&presentation=true');
    await page.getByText('Technical details', { exact: true }).click();
    await expect(page.getByText('FCST-ALEX-20260725-01')).toBeVisible();
    await page.keyboard.press('Shift+D');
    await page
      .getByRole('button', { name: 'Open interviewer audit viewer' })
      .click();
    await expect(page.getByRole('dialog')).toContainText(
      'FCST-ALEX-20260725-01'
    );
  });

  test('advisor confirmation appears only after the advisor interaction', async ({
    page,
  }) => {
    const confirmation =
      'Your advisor-support preference was saved in this prototype. No external message or request was sent.';
    await expect(page.getByText(confirmation)).toHaveCount(0);
    await page.getByRole('button', { name: 'Talk with an advisor' }).click();
    await expect(page.getByRole('status')).toHaveText(confirmation);

    await page.goto('/?scenario=baseline&presentation=true');
    await expect(page.getByText(confirmation)).toHaveCount(0);
    await page.getByRole('button', { name: 'Talk with an advisor' }).click();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Reset demo' }).click();
    await expect(page.getByText(confirmation)).toHaveCount(0);
  });
});
