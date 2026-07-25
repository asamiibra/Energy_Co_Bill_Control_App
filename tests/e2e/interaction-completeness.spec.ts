import { expect, test, type Page } from '@playwright/test';

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
] as const;

const storageKeys = [
  'bill-control-audit-events',
  'bill-control-saved-plans',
  'bill-control-local-reminders',
  'bill-control-support-interests',
  'bill-control-consent-overrides',
] as const;

async function observableState(page: Page, interactionId: string) {
  return page.evaluate(
    ({ id, keys }) => {
      const control = document.querySelector<HTMLElement>(
        `[data-interaction-id="${CSS.escape(id)}"]`
      );
      return Object.fromEntries([
        ['url', window.location.href],
        ['body', document.body.innerText],
        ['expanded', control?.getAttribute('aria-expanded') ?? null],
        [
          'checked',
          control instanceof HTMLInputElement ? control.checked : false,
        ],
        [
          'value',
          control instanceof HTMLInputElement ||
          control instanceof HTMLTextAreaElement
            ? control.value
            : '',
        ],
        ['dialogs', document.querySelectorAll('[role="dialog"]').length],
        [
          'storage',
          Object.fromEntries(
            keys.map((key) => [key, localStorage.getItem(key)])
          ),
        ],
      ]);
    },
    { id: interactionId, keys: storageKeys }
  );
}

test.describe('interaction completeness', () => {
  test.skip(({ browserName }) => browserName !== 'chromium');

  for (const scenario of scenarios) {
    test(`${scenario} has no enabled dead controls`, async ({ page }) => {
      const route = `/?scenario=${scenario}&presentation=true`;
      await page.goto(route);

      const interactionIds = await page
        .locator('[data-interaction-id]:visible:not(:disabled)')
        .evaluateAll((elements) =>
          elements
            .filter(
              (element) =>
                !(
                  element instanceof HTMLInputElement &&
                  element.type === 'radio' &&
                  element.checked
                )
            )
            .map((element) => element.getAttribute('data-interaction-id'))
            .filter((id): id is string => Boolean(id))
        );

      expect(new Set(interactionIds).size).toBe(interactionIds.length);

      for (const interactionId of interactionIds) {
        if (
          scenario === 'consent' &&
          interactionId === 'footer-consent-preferences'
        ) {
          continue;
        }

        await page.goto(route);
        const control = page.locator(
          `[data-interaction-id="${interactionId}"]`
        );
        await expect(control).toBeVisible();

        const before = await observableState(page, interactionId);
        await control.click();
        await page.waitForTimeout(25);
        const after = await observableState(page, interactionId);

        expect(
          after,
          `Expected ${interactionId} on ${scenario} to produce an observable outcome`
        ).not.toEqual(before);
      }
    });
  }

  test('nested shared controls have observable outcomes', async ({ page }) => {
    await page.goto('/?scenario=baseline');

    await page.getByLabel('Prototype disclosure').waitFor();
    await page.getByRole('button', { name: 'Demo scenario switcher' }).click();
    await page
      .getByRole('button', { name: 'Open interviewer audit viewer' })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Close audit viewer' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.getByRole('button', { name: 'Help and Support' }).click();
    await expect(
      page.getByRole('heading', { name: 'Bill Control help' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();

    await page
      .getByRole('button', { name: 'Skip to Forecast Details' })
      .click();
    await page.getByRole('button', { name: 'Save this action' }).click();
    await page.getByLabel('Notes (optional)').fill('Keep comfort unchanged.');
    await page.getByRole('button', { name: 'Save Action Plan' }).click();
    await expect(page.getByRole('dialog')).toContainText(
      'no automatic changes'
    );
  });
});

test.describe('Safety Guardrail interaction contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?scenario=safety&presentation=true');
  });

  test('keeps the customer surface safe and singular', async ({ page }) => {
    await expect(page.getByLabel('Prototype disclosure')).toHaveCount(1);
    await expect(
      page.getByText('Reduce essential heating overnight')
    ).toHaveCount(0);
    await expect(page.getByText(/BC-SAFE-ESSENTIAL/i)).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Speak with an advisor' })
    ).toHaveCount(1);

    await page
      .getByRole('button', { name: 'How was this decision made?' })
      .click();
    await expect(
      page.getByText('A heating-reduction recommendation was withheld.')
    ).toBeVisible();
    await expect(
      page.getByText('Reduce essential heating overnight')
    ).toHaveCount(0);
  });

  test('retains restricted details in the interviewer audit viewer', async ({
    page,
  }) => {
    await page.goto('/?scenario=safety');
    await page
      .getByRole('button', { name: 'Skip to Forecast Details' })
      .click();
    await page.getByRole('button', { name: 'Demo scenario switcher' }).click();
    await page
      .getByRole('button', { name: 'Open interviewer audit viewer' })
      .click();
    const audit = page.getByRole('dialog');
    await expect(audit).toContainText('POLICY-JORDAN-ESSENTIAL-001');
    await expect(audit).toContainText('Reduce essential heating overnight');
    await expect(audit).toContainText('customer_declared_essential_use');
    await expect(audit).toContainText('safeAlternatives');
    await expect(audit).toContainText('occurredAt');
  });

  test('saves budget and assistance interest locally only', async ({
    page,
  }) => {
    for (const name of [
      'Explore budget-plan support',
      'Review assistance programs',
    ]) {
      await page.getByRole('button', { name }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Save my interest' }).click();
      await expect(page.getByRole('status')).toContainText(
        'No application was submitted'
      );
    }

    const stored = await page.evaluate(() =>
      localStorage.getItem('bill-control-support-interests')
    );
    expect(stored).toContain('budget_plan');
    expect(stored).toContain('assistance_programs');
  });

  test('shows safe alternatives and stores advisor preference locally', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'View low-impact alternatives' })
      .click();
    await expect(page.getByRole('dialog')).toContainText(
      'These options do not reduce essential heating'
    );
    await page.getByRole('button', { name: 'Done' }).click();

    await page.getByRole('button', { name: 'Speak with an advisor' }).click();
    await page.getByLabel('Message me').check();
    await page.getByRole('button', { name: 'Save preference' }).click();
    await expect(page.getByRole('status')).toContainText(
      'No external request was sent'
    );

    const stored = await page.evaluate(() =>
      localStorage.getItem('bill-control-support-interests')
    );
    expect(stored).toContain('"preference":"message"');
  });

  test('reset clears local support intents without weakening protection', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'Explore budget-plan support' })
      .click();
    await page.getByRole('button', { name: 'Save my interest' }).click();

    await page.keyboard.press('Shift+D');
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Reset prototype' }).click();

    await expect(page).toHaveURL(/scenario=baseline/);
    expect(
      await page.evaluate(() =>
        localStorage.getItem('bill-control-support-interests')
      )
    ).toBeNull();

    await page.goto('/?scenario=safety&presentation=true');
    await expect(
      page.getByText('Essential-use protection active')
    ).toBeVisible();
    await expect(
      page.getByText('Reduce essential heating overnight')
    ).toHaveCount(0);
  });
});
