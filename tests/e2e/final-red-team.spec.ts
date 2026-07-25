import { expect, test } from '@playwright/test';

const hostileScenarios = [
  'DOES-NOT-EXIST',
  ' baseline ',
  '<script>window.__billControlXss=true</script>',
  '../../etc/passwd',
  'null',
  'undefined',
  '%00',
];

test.describe('final red-team routing and storage', () => {
  for (const scenario of hostileScenarios) {
    test(`hostile scenario ${JSON.stringify(scenario)} fails closed`, async ({
      page,
    }) => {
      await page.goto(`/?scenario=${encodeURIComponent(scenario)}`);
      await expect(
        page.getByRole('heading', { name: 'Scenario Not Found' })
      ).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            (window as typeof window & { __billControlXss?: boolean })
              .__billControlXss
        )
      ).toBeUndefined();
    });
  }

  test('empty and missing scenario values resolve deterministically', async ({
    page,
  }) => {
    for (const url of ['/', '/?scenario=']) {
      await page.goto(url);
      await expect(
        page.getByRole('button', { name: 'Skip to Forecast Details' })
      ).toBeVisible();
    }
  });

  test('malformed prototype storage cannot break a route', async ({ page }) => {
    await page.addInitScript(() => {
      for (const key of [
        'bill-control-audit-events',
        'bill-control-saved-plans',
        'bill-control-local-reminders',
      ]) {
        localStorage.setItem(key, '{not-json');
      }
    });
    await page.goto('/?scenario=safety&presentation=true');
    await expect(
      page.getByText('Essential Use Protection Active')
    ).toBeVisible();
  });

  test('rapid history transitions do not cross-contaminate states', async ({
    page,
  }) => {
    await page.goto('/?scenario=baseline&presentation=true');
    for (let index = 0; index < 20; index += 1) {
      await page.keyboard.press(String((index % 3) + 1));
    }
    await page.keyboard.press('3');
    await expect(
      page.getByText('Essential Use Protection Active')
    ).toBeVisible();
    await expect(
      page.getByText('Reduce essential heating overnight')
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /switch tariff|change thermostat/i })
    ).toHaveCount(0);
  });
});

test.describe('final red-team interaction truthfulness', () => {
  test('baseline reminder, decline, and advisor controls are local-only', async ({
    page,
  }) => {
    await page.goto('/?scenario=baseline&presentation=true');
    await page.getByRole('button', { name: 'Set reminder' }).click();
    await expect(page.getByRole('status')).toContainText('browser only');
    await page.getByRole('button', { name: 'Not now' }).click();
    await expect(page.getByRole('status')).toContainText('No action');
    await page.getByRole('button', { name: 'Talk with an advisor' }).click();
    await expect(page.getByRole('status')).toContainText('No message');
  });

  test('safety support never claims eligibility or execution', async ({
    page,
  }) => {
    await page.goto('/?scenario=safety&presentation=true');
    await page
      .getByRole('button', { name: /Check budget-plan eligibility/ })
      .click();
    await expect(page.getByRole('status')).toContainText(
      'Eligibility was not checked'
    );
    await page.getByRole('button', { name: /Speak with an advisor/ }).click();
    await expect(page.getByRole('status')).toContainText('No call');
    await expect(
      page.getByText('Reduce essential heating overnight')
    ).toBeVisible();
  });

  test('cold-start and forecast-miss actions produce auditable feedback', async ({
    page,
  }) => {
    await page.goto('/?scenario=cold-start&presentation=true');
    await page.getByRole('button', { name: 'Set alert preference' }).click();
    await expect(page.getByRole('status')).toContainText('browser only');

    await page.goto('/?scenario=forecast-miss&presentation=true');
    await page.getByRole('button', { name: 'Talk with an advisor' }).click();
    await expect(page.getByRole('status')).toContainText('No message');
    await page
      .getByRole('button', { name: 'Acknowledge and continue' })
      .click();
    const events = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('bill-control-audit-events') || '[]')
    );
    expect(
      events.some(
        (event: { eventName: string }) =>
          event.eventName === 'forecast_miss_acknowledged'
      )
    ).toBe(true);
  });

  test('privacy and shell actions disclose prototype limits', async ({
    page,
  }) => {
    await page.goto('/?scenario=consent&presentation=true');
    await page
      .getByRole('button', { name: /View full privacy policy/ })
      .click();
    await expect(page.getByRole('status')).toContainText('no external policy');
    await page.getByRole('button', { name: 'Contact privacy team' }).click();
    await expect(page.getByRole('status')).toContainText('No message');

    await page.goto('/?scenario=baseline');
    await page.getByRole('button', { name: 'Help and Support' }).click();
    await expect(page.getByRole('status')).toContainText('does not contact');
    await page.getByRole('button', { name: 'Account Menu' }).click();
    await expect(page.getByRole('status')).toContainText('synthetic demo');
    await page.getByRole('button', { name: 'Consent and preferences' }).click();
    await expect(page).toHaveURL(/scenario=consent/);
  });
});

test.describe('final red-team compact and preference rendering', () => {
  test('200% text scaling remains horizontally contained', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/?scenario=safety&presentation=true');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    const widths = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
      offenders: [...document.querySelectorAll<HTMLElement>('body *')]
        .map((element) => ({
          tag: element.tagName,
          text: element.textContent?.trim().slice(0, 60),
          right: Math.round(element.getBoundingClientRect().right),
          width: Math.round(element.getBoundingClientRect().width),
          classes: element.className,
        }))
        .filter((element) => element.right > window.innerWidth + 1)
        .slice(0, 10),
    }));
    expect(
      widths.content,
      JSON.stringify(widths.offenders, null, 2)
    ).toBeLessThanOrEqual(widths.viewport + 1);
  });

  test('reduced motion does not hide core content', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?scenario=alert&presentation=true');
    await expect(page.getByText('Your estimate changed')).toBeVisible();
  });

  test('focus rings appear only during keyboard focus', async ({ page }) => {
    await page.goto('/?scenario=baseline');
    const help = page.getByRole('button', { name: 'Help and Support' });
    await expect(help).toHaveCSS('box-shadow', 'none');
    await help.focus();
    await expect(help).not.toHaveCSS('box-shadow', 'none');
  });
});
