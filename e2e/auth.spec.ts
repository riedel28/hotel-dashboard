import { expect, test } from '@playwright/test';

const TEST_USER = {
  firstName: 'John'
};

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
    });

    test('should display login form', async ({ page }) => {
      const form = page.locator('form');

      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
      await expect(form.getByLabel('Email')).toBeVisible();
      await expect(form.getByLabel('Password', { exact: true })).toBeVisible();
      await expect(form.getByRole('button', { name: 'Login' })).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.locator('form').getByRole('button', { name: 'Login' }).click();

      await expect(page.getByText('Invalid email format')).toBeVisible();
      await expect(page.getByText('Password is required')).toBeVisible();
    });

    test('should show error toast for invalid credentials', async ({
      page
    }) => {
      const form = page.locator('form');
      await form.getByLabel('Email').fill('wrong@example.com');
      await form.getByLabel('Password', { exact: true }).fill('wrong_password');
      await form.getByRole('button', { name: 'Login' }).click();

      await expect(
        page.getByText('Failed to login. Please try again.')
      ).toBeVisible();
    });

    test('should login successfully and redirect to dashboard', async ({
      page
    }) => {
      const form = page.locator('form');
      await form.getByLabel('Email').fill(process.env.E2E_USER_EMAIL!);
      await form
        .getByLabel('Password', { exact: true })
        .fill(process.env.E2E_USER_PASSWORD!);
      await form.getByRole('button', { name: 'Login' }).click();

      await expect(page).toHaveURL('/');
      await expect(
        page.getByRole('heading', {
          name: `Welcome back, ${TEST_USER.firstName}!`
        })
      ).toBeVisible();
    });

    test('should redirect to requested page after login', async ({ page }) => {
      await page.goto('/auth/login?redirect=%2Fprofile');

      const form = page.locator('form');
      await form.getByLabel('Email').fill(process.env.E2E_USER_EMAIL!);
      await form
        .getByLabel('Password', { exact: true })
        .fill(process.env.E2E_USER_PASSWORD!);
      await form.getByRole('button', { name: 'Login' }).click();

      await expect(page).toHaveURL('/profile');
    });

    test('should redirect authenticated user away from login page', async ({
      page
    }) => {
      const form = page.locator('form');
      await form.getByLabel('Email').fill(process.env.E2E_USER_EMAIL!);
      await form
        .getByLabel('Password', { exact: true })
        .fill(process.env.E2E_USER_PASSWORD!);
      await form.getByRole('button', { name: 'Login' }).click();
      await expect(page).toHaveURL('/');

      await page.goto('/auth/login');

      await expect(page).not.toHaveURL(/\/auth\/login/);
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Logout', () => {
    test('should open logout confirmation dialog', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'User menu' }).click();
      await page.getByRole('menuitem', { name: 'Log out' }).click();

      await expect(
        page.getByRole('alertdialog', {
          name: 'Are you sure you want to logout?'
        })
      ).toBeVisible();
    });

    test('should cancel logout and stay on dashboard', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'User menu' }).click();
      await page.getByRole('menuitem', { name: 'Log out' }).click();
      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect(page).toHaveURL('/');
      await expect(
        page.getByRole('heading', {
          name: `Welcome back, ${TEST_USER.firstName}!`
        })
      ).toBeVisible();
    });

    test('should logout and redirect to login page', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'User menu' }).click();
      await page.getByRole('menuitem', { name: 'Log out' }).click();

      await page
        .getByRole('alertdialog')
        .getByRole('button', { name: 'Log out' })
        .click();

      await expect(page).toHaveURL('/auth/login');
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    });

    test('should require login after logout', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'User menu' }).click();
      await page.getByRole('menuitem', { name: 'Log out' }).click();
      await page
        .getByRole('alertdialog')
        .getByRole('button', { name: 'Log out' })
        .click();
      await expect(page).toHaveURL('/auth/login');

      await page.goto('/');

      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });
});
