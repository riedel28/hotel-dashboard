import { expect, test } from '@playwright/test';

import { resetDatabase } from './helpers/reset-db';

const PROPERTY = 'Bates Motel';

test.describe('Customers', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  // Leave the seed state behind: the reassigned property must not leak into
  // the specs that run afterwards.
  test.afterAll(async () => {
    await resetDatabase();
  });

  test('a new customer can be given a property', async ({ page }) => {
    // An administrator creates a customer.
    await page.goto('/admin/customers');
    await page.getByRole('button', { name: 'Add Customer' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('First name').fill('Hans');
    await dialog.getByLabel('Last name').fill('Gruber');
    await dialog.getByLabel(/Company/).fill('Nakatomi Hotels');
    await dialog.getByLabel('Email').fill('hans.gruber@example.com');
    await dialog.getByLabel('Address line 1').fill('2121 Avenue of the Stars');
    await dialog.getByLabel('ZIP').fill('90067');
    await dialog.getByLabel('City').fill('Los Angeles');
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('Customer created successfully')).toBeVisible();
    const customerRow = page
      .getByRole('row')
      .filter({ hasText: 'Hans Gruber' });
    await expect(customerRow).toContainText('Nakatomi Hotels');
    await expect(customerRow).toContainText('Los Angeles');

    // The same email again is refused on the field, whatever its case.
    await page.getByRole('button', { name: 'Add Customer' }).click();
    await dialog.getByLabel('First name').fill('Simon');
    await dialog.getByLabel('Last name').fill('Gruber');
    await dialog.getByLabel('Email').fill('Hans.Gruber@example.com');
    await dialog.getByLabel('Address line 1').fill('1 Wall Street');
    await dialog.getByLabel('ZIP').fill('10005');
    await dialog.getByLabel('City').fill('New York');
    await dialog.getByRole('button', { name: 'Create' }).click();
    await expect(
      dialog.getByText('A customer with this email already exists')
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    // The property is handed over to the new customer.
    await page.goto('/admin/properties');
    const propertyRow = page.getByRole('row').filter({ hasText: PROPERTY });
    await propertyRow.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();

    await page.getByRole('combobox', { name: 'Customer' }).click();
    await page.getByPlaceholder('Search customers').fill('nakatomi');
    await page.getByRole('option', { name: /Nakatomi Hotels/ }).click();
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('Property updated successfully')).toBeVisible();

    // The properties table names the customer and links to its page, which
    // lists the property back.
    await page.goto('/admin/properties');
    await propertyRow.getByRole('link', { name: 'Nakatomi Hotels' }).click();
    await expect(
      page.getByRole('heading', { name: 'Edit Customer' })
    ).toBeVisible();
    await expect(
      page.getByRole('main').getByText('Nakatomi Hotels', { exact: true })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: PROPERTY })).toBeVisible();
  });
});
