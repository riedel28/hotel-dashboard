import { expect, type Page, test } from '@playwright/test';

const TEST_USER = {
  email: 'john@example.com',
  password: 'very_cool_password'
};

const EDITABLE_USER_NAME = 'Very Cool';

async function login(page: Page) {
  await page.goto('/auth/login');
  const form = page.locator('form');
  await form.getByLabel('Email').fill(TEST_USER.email);
  await form.getByLabel('Password', { exact: true }).fill(TEST_USER.password);
  await form.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/');
}

async function navigateToEditUser(page: Page) {
  await page.getByRole('link', { name: 'Users', exact: true }).click();
  await expect(page).toHaveURL(/\/users/);
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();

  const row = page.getByRole('row').filter({ hasText: EDITABLE_USER_NAME });
  await row.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();

  await expect(page.getByRole('heading', { name: 'Edit user' })).toBeVisible();
  // Wait for the form to be loaded (Suspense resolved)
  await expect(page.locator('form')).toBeVisible();
}

test.describe('Edit User', () => {
  // Tests must run serially because they modify the same user
  test.describe.configure({ mode: 'serial' });

  test('should navigate to edit user page and display form with current values', async ({
    page
  }) => {
    await login(page);
    await navigateToEditUser(page);

    const form = page.locator('form');
    await expect(form.getByLabel('Email')).toHaveValue(
      'cool_new_user@example.com'
    );
    await expect(form.getByLabel('First Name')).toHaveValue('Very');
    await expect(form.getByLabel('Last Name')).toHaveValue('Cool');
  });

  test('should update all user fields and verify values persist', async ({
    page
  }) => {
    await login(page);
    await navigateToEditUser(page);

    const form = page.locator('form');

    // Update first name
    const firstNameInput = form.getByLabel('First Name');
    await firstNameInput.clear();
    await firstNameInput.fill('Updated');

    // Update last name
    const lastNameInput = form.getByLabel('Last Name');
    await lastNameInput.clear();
    await lastNameInput.fill('User');

    // Select a country using the country picker combobox
    await page.getByLabel('Select country').click();
    await page.getByPlaceholder('Search country...').fill('Germany');
    await page.getByRole('option', { name: 'Germany' }).click();

    // Submit the form
    await form.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('User updated successfully')).toBeVisible();

    // Reload the page to verify persistence
    await page.reload();
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });

    const reloadedForm = page.locator('form');
    await expect(reloadedForm.getByLabel('First Name')).toHaveValue('Updated');
    await expect(reloadedForm.getByLabel('Last Name')).toHaveValue('User');
    // Verify country picker shows selected country
    await expect(page.getByLabel('Select country')).toContainText('Germany');

    // Revert changes so the test is repeatable
    await reloadedForm.getByLabel('First Name').clear();
    await reloadedForm.getByLabel('First Name').fill('Very');
    await reloadedForm.getByLabel('Last Name').clear();
    await reloadedForm.getByLabel('Last Name').fill('Cool');
    await reloadedForm.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('User updated successfully')).toBeVisible();
  });
});
