import { expect, type Page, test } from '@playwright/test';

import { resetDatabase } from './helpers/reset-db';

const RESTRICTED_PROPERTY = 'The Dolphin Hotel';
const FULL_PROPERTY = 'The Overlook Hotel';

async function selectProperty(page: Page, propertyName: string) {
  const responsePromise = page.waitForResponse(
    (resp) => resp.url().includes('/selected-property') && resp.status() === 200
  );
  await page.getByLabel('Select property').click();
  await page.getByRole('option', { name: propertyName }).click();
  await responsePromise;
}

test.describe('Property nav items', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  // Leave the seed state behind: a nav item switched off here must not leak
  // into the specs that run afterwards.
  test.afterAll(async () => {
    await resetDatabase();
  });

  test('a nav item switched off for a property is hidden and redirects to Start', async ({
    page
  }) => {
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const roomsLink = nav.getByRole('link', { name: 'Rooms' });

    // An administrator switches Rooms off for one property.
    await page.goto('/admin/properties');
    const row = page.getByRole('row').filter({ hasText: RESTRICTED_PROPERTY });
    await row.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();

    const roomsCheckbox = page.getByRole('checkbox', { name: 'Rooms' });
    await expect(roomsCheckbox).toBeChecked();
    await roomsCheckbox.click();
    await page.getByRole('button', { name: 'Update Property' }).click();
    await expect(page.getByText('Property updated successfully')).toBeVisible();

    // The item and its Start page card are gone; its page redirects to Start.
    await page.goto('/');
    await selectProperty(page, RESTRICTED_PROPERTY);
    await expect(nav.getByRole('link', { name: 'Start' })).toBeVisible();
    await expect(roomsLink).toHaveCount(0);
    await expect(
      page.getByRole('main').getByRole('link', { name: /Rooms/ })
    ).toHaveCount(0);

    await page.goto('/rooms');
    await expect(page).toHaveURL('/');

    // Other properties keep the item, and switching away from a page the new
    // property has switched off lands on Start.
    await selectProperty(page, FULL_PROPERTY);
    await roomsLink.click();
    await expect(page).toHaveURL(/\/rooms/);

    await selectProperty(page, RESTRICTED_PROPERTY);
    await expect(page).toHaveURL('/');
    await expect(roomsLink).toHaveCount(0);
  });
});
