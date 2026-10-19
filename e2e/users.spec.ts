import { expect, type Page, test } from '@playwright/test';

import { resetDatabase } from './helpers/reset-db';

const EDITABLE_USER_EMAIL = 'cool_new_user@example.com';
const EDITABLE_USER_DISPLAY = 'Very Cool';

async function navigateToEditUser(
  page: Page,
  displayName = EDITABLE_USER_DISPLAY
) {
  // The sidebar's link: on the users page the breadcrumb names it too
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Users', exact: true })
    .click();
  await expect(page).toHaveURL(/\/users/);
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();

  // Type into search input to filter by email (handles pagination)
  const responsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes('/api/users') &&
      resp.url().includes('q=') &&
      resp.status() === 200
  );
  await page.getByRole('searchbox').fill(EDITABLE_USER_EMAIL);
  await responsePromise;

  const row = page.getByRole('row').filter({ hasText: displayName });
  await row.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('menuitem', { name: 'Edit user' }).click();

  // The form opens in a drawer beside the list
  await expect(page.getByRole('heading', { name: 'Edit user' })).toBeVisible();
  await expect(page.getByRole('dialog').locator('form')).toBeVisible();
}

test.describe('Edit User', () => {
  // Tests share a mutable user — serial prevents race conditions
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    await resetDatabase();
  });

  test('should open the user in the drawer with the current values', async ({
    page
  }) => {
    await page.goto('/');
    await navigateToEditUser(page);

    const form = page.getByRole('dialog').locator('form');
    await expect(form.getByLabel('Email')).toHaveValue(
      'cool_new_user@example.com'
    );
    await expect(form.getByLabel('First Name')).toHaveValue('Very');
    await expect(form.getByLabel('Last Name')).toHaveValue('Cool');
  });

  test('should update all user fields and verify values persist', async ({
    page
  }) => {
    await page.goto('/');
    await navigateToEditUser(page);

    const form = page.getByRole('dialog').locator('form');

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

    // Submitted from the keyboard: in a dev build the router devtools badge
    // sits on top of the drawer's Save button.
    await lastNameInput.press('Enter');
    await expect(page.getByText('User updated successfully')).toBeVisible();

    // Saving closes the drawer; load the app afresh and open the user again
    // to check the values were stored
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.goto('/');
    await navigateToEditUser(page, 'Updated User');

    const reloadedForm = page.getByRole('dialog').locator('form');
    await expect(reloadedForm.getByLabel('First Name')).toHaveValue('Updated');
    await expect(reloadedForm.getByLabel('Last Name')).toHaveValue('User');
    // Verify country picker shows selected country
    await expect(page.getByLabel('Select country')).toContainText('Germany');
  });
});
