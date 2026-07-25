import { chromium } from '@playwright/test';
import { cp, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const localBaseUrl = 'http://127.0.0.1:3100';
const baseUrl = process.env.BASE_URL || localBaseUrl;
const scenarios = {
  baseline: {
    text: 'Your bill is currently expected to be $178.',
    values: ['$128.36', '$171–$204', '8 days remaining'],
  },
  alert: {
    text: 'Your estimate changed',
    values: ['$164', '$186', '$168–$204'],
  },
  safety: {
    text: 'Essential-use protection active',
    values: [
      'Jordan Lee',
      'We are not recommending changes to essential heating under current conditions.',
    ],
  },
};

let server;

async function waitForServer(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

try {
  if (!process.env.BASE_URL) {
    server = spawn(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['run', 'start', '--', '--hostname', '127.0.0.1', '--port', '3100'],
      { stdio: 'inherit' }
    );
    await waitForServer(localBaseUrl);
  }

  await mkdir('public/fallback', { recursive: true });
  await mkdir('artifacts/screenshots', { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });

  for (const [scenario, contract] of Object.entries(scenarios)) {
    const page = await context.newPage();
    await page.goto(`${baseUrl}/?scenario=${scenario}&presentation=true`, {
      waitUntil: 'networkidle',
    });
    await page.addStyleTag({
      content: '[data-demo-utility] { display: none !important; }',
    });

    await page.getByText(contract.text, { exact: false }).first().waitFor();
    for (const value of contract.values) {
      await page.getByText(value, { exact: false }).first().waitFor();
    }

    if ((await page.getByText('Bill Control', { exact: true }).count()) === 0) {
      throw new Error(`${scenario}: product name is missing`);
    }
    if ((await page.locator('[data-demo-utility]:visible').count()) !== 0) {
      throw new Error(`${scenario}: demo utility is visible`);
    }
    if (
      (await page.getByText(/synthetic customer and energy data/i).count()) ===
      0
    ) {
      throw new Error(`${scenario}: synthetic-data notice is missing`);
    }

    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
    await page.mouse.move(0, 0);

    const fallbackPath = `public/fallback/${scenario}.png`;
    const deckPath = `artifacts/screenshots/${scenario}-deck.png`;
    await page.screenshot({ path: fallbackPath, fullPage: true });
    await page.screenshot({ path: deckPath, fullPage: false });
    await cp(fallbackPath, `artifacts/interview-fallback/${scenario}.png`, {
      force: true,
    }).catch(async () => {
      await mkdir('artifacts/interview-fallback', { recursive: true });
      await cp(fallbackPath, `artifacts/interview-fallback/${scenario}.png`);
    });
    await page.close();
  }

  await browser.close();
  console.log('Generated canonical fallback and deck screenshots.');
} finally {
  if (server) {
    server.kill('SIGTERM');
  }
}
