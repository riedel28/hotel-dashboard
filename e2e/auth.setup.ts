import { expect, test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  setup.setTimeout(60_000);
  await page.goto('/auth/login', { waitUntil: 'networkidle' });

  const form = page.locator('form');
  await form.getByLabel('Email').fill(process.env.E2E_USER_EMAIL!);
  await form
    .getByLabel('Password', { exact: true })
    .fill(process.env.E2E_USER_PASSWORD!);
  await form.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL('/');

  await page.context().storageState({ path: authFile });
});
