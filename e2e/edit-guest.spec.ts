import { expect, type Page, test } from '@playwright/test';

async function navigateToReservationEdit(page: Page, bookingNr: string) {
  await page.getByRole('link', { name: 'Reservations', exact: true }).click();
  await expect(page).toHaveURL(/\/reservations/);
  await expect(
    page.getByRole('heading', { name: 'Reservations' })
  ).toBeVisible();

  // Open row actions for the target reservation and click Edit
  const row = page.getByRole('row').filter({ hasText: bookingNr });
  await row.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();

  await expect(
    page.getByRole('heading', { name: 'Edit reservation' })
  ).toBeVisible();
}

test.describe('Edit Guest', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // RES-003 has a single guest (Mike Wilson, AT) — simplest to test
    await navigateToReservationEdit(page, 'RES-003');
  });

  test('should update all guest fields via the edit guest modal', async ({
    page
  }) => {
    // Open the guest dropdown menu and click "Edit guest"
    const guestRow = page
      .locator('div')
      .filter({ hasText: /Mike Wilson/ })
      .filter({ has: page.getByRole('button', { name: 'Open guest menu' }) });
    await guestRow.getByRole('button', { name: 'Open guest menu' }).click();
    await page.getByRole('menuitem', { name: 'Edit guest' }).click();

    // Verify the Edit Guest dialog opens with pre-populated values
    const dialog = page.getByRole('dialog', { name: 'Edit Guest' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('First Name')).toHaveValue('Mike');
    await expect(dialog.getByLabel('Last Name')).toHaveValue('Wilson');
    await expect(dialog.getByLabel('Email')).toHaveValue(
      'mike.wilson@example.com'
    );

    // Update all fields
    await dialog.getByLabel('First Name').clear();
    await dialog.getByLabel('First Name').fill('Carlos');

    await dialog.getByLabel('Last Name').clear();
    await dialog.getByLabel('Last Name').fill('Rivera');

    await dialog.getByLabel('Email').clear();
    await dialog.getByLabel('Email').fill('carlos.rivera@example.com');

    // Change nationality — pick a country NOT in the old hardcoded list (e.g. France)
    await dialog.getByLabel('Select country').click();
    await page.getByPlaceholder('Search country...').fill('France');
    await page.getByRole('option', { name: /France/ }).click();

    // Submit the form
    await dialog.getByRole('button', { name: 'Save Changes' }).click();

    // Dialog should close
    await expect(dialog).not.toBeVisible();

    // Verify the guest name in the reservation form updated
    await expect(page.getByText('Carlos Rivera')).toBeVisible();

    // Save the reservation to persist changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(
      page.getByText('Reservation updated successfully')
    ).toBeVisible();

    // Reload the page and verify changes persisted
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Edit reservation' })
    ).toBeVisible();

    // The updated guest name should still be there
    await expect(page.getByText('Carlos Rivera')).toBeVisible();

    // Open the edit guest modal again to verify all fields persisted
    const updatedGuestRow = page
      .locator('div')
      .filter({ hasText: /Carlos Rivera/ })
      .filter({ has: page.getByRole('button', { name: 'Open guest menu' }) });
    await updatedGuestRow
      .getByRole('button', { name: 'Open guest menu' })
      .click();
    await page.getByRole('menuitem', { name: 'Edit guest' }).click();

    const verifyDialog = page.getByRole('dialog', { name: 'Edit Guest' });
    await expect(verifyDialog).toBeVisible();
    await expect(verifyDialog.getByLabel('First Name')).toHaveValue('Carlos');
    await expect(verifyDialog.getByLabel('Last Name')).toHaveValue('Rivera');
    await expect(verifyDialog.getByLabel('Email')).toHaveValue(
      'carlos.rivera@example.com'
    );
    // Verify the country changed to France
    await expect(verifyDialog.getByText('France')).toBeVisible();

    // Revert changes so the test is repeatable across browser suites
    await verifyDialog.getByLabel('First Name').clear();
    await verifyDialog.getByLabel('First Name').fill('Mike');
    await verifyDialog.getByLabel('Last Name').clear();
    await verifyDialog.getByLabel('Last Name').fill('Wilson');
    await verifyDialog.getByLabel('Email').clear();
    await verifyDialog.getByLabel('Email').fill('mike.wilson@example.com');
    await verifyDialog.getByLabel('Select country').click();
    await page.getByPlaceholder('Search country...').fill('Austria');
    await page.getByRole('option', { name: /Austria/ }).click();
    await verifyDialog.getByRole('button', { name: 'Save Changes' }).click();
    await expect(verifyDialog).not.toBeVisible();
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(
      page.getByText('Reservation updated successfully')
    ).toBeVisible();
  });
});
