import { expect, type Page, test } from '@playwright/test';

import { resetDatabase } from './helpers/reset-db';

const TEST_PROPERTY_NAME = 'Bates Motel';

async function selectProperty(page: Page) {
  const responsePromise = page.waitForResponse(
    (resp) => resp.url().includes('/selected-property') && resp.status() === 200
  );
  await page
    .getByRole('combobox', { name: /^Select property$|, property$/ })
    .click();
  await page.getByRole('option', { name: TEST_PROPERTY_NAME }).click();
  await responsePromise;
}

test.describe('Rooms', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await selectProperty(page);
    await page.goto('/rooms');
    await expect(page.getByRole('heading', { name: 'Rooms' })).toBeVisible();
  });

  // A property without rooms offers "Add room" twice: in the header and in
  // the empty state. The header's comes first and is always there.
  const addRoomButton = (page: Page) =>
    page.getByRole('button', { name: 'Add room' }).first();

  // The form's fields by label, apart from the filters behind it (the search
  // is labelled "Search number or name")
  const drawer = (page: Page) => page.getByRole('dialog');

  // Creates a room through the drawer and returns its number
  async function createRoom(page: Page, roomName: string) {
    const roomNumber = `E2E-${Date.now()}`;
    await addRoomButton(page).click();
    await expect(page.getByRole('heading', { name: 'Add room' })).toBeVisible();

    await drawer(page).getByLabel('Number').fill(roomNumber);
    await drawer(page).getByLabel('Name').fill(roomName);
    await drawer(page).getByLabel('Type').fill('Suite');

    await drawer(page)
      .getByRole('button', { name: 'Add', exact: true })
      .click();

    await expect(page.getByText('Room created successfully')).toBeVisible();

    // Navigate with search filter to find the room regardless of pagination
    await page.goto(`/rooms?q=${encodeURIComponent(roomName)}`);
    await expect(page.getByRole('cell', { name: roomName })).toBeVisible();
    return roomNumber;
  }

  test('should create a room via the drawer', async ({ page }) => {
    await createRoom(page, `E2E Room ${Date.now()}`);
  });

  test('should reject a room number that is taken', async ({ page }) => {
    const roomNumber = await createRoom(page, `E2E Taken Room ${Date.now()}`);

    await addRoomButton(page).click();
    await drawer(page).getByLabel('Number').fill(roomNumber.toLowerCase());
    await drawer(page).getByLabel('Type').fill('Suite');
    await drawer(page)
      .getByRole('button', { name: 'Add', exact: true })
      .click();

    await expect(
      page.getByText('A room with this number already exists')
    ).toBeVisible();
  });

  test('should edit a room via the drawer', async ({ page }) => {
    const roomName = `E2E Edit Room ${Date.now()}`;
    await createRoom(page, roomName);

    // Open row actions for the created room
    const row = page.getByRole('row').filter({ hasText: roomName });
    await row.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();

    // The drawer opens with the room filled in
    await expect(
      page.getByRole('heading', { name: 'Edit room' })
    ).toBeVisible();
    await expect(drawer(page).getByLabel('Name')).toHaveValue(roomName);

    const updatedName = `${roomName} Updated`;
    await drawer(page).getByLabel('Name').fill(updatedName);
    // Submitted from the keyboard: in a dev build the router devtools badge
    // sits on top of the drawer's Update button.
    await drawer(page).getByLabel('Name').press('Enter');

    await expect(page.getByText('Room updated successfully')).toBeVisible();

    await page.goto(`/rooms?q=${encodeURIComponent(updatedName)}`);
    await expect(page.getByRole('cell', { name: updatedName })).toBeVisible();
  });

  test('should delete a room via the Delete dialog', async ({ page }) => {
    const roomName = `E2E Delete Room ${Date.now()}`;
    const roomNumber = await createRoom(page, roomName);

    // Open row actions for the created room
    const row = page.getByRole('row').filter({ hasText: roomName });
    await row.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    // The confirmation names the room by its number
    const dialog = page.getByRole('alertdialog');
    await expect(
      dialog.getByRole('heading', { name: 'Are you sure?' })
    ).toBeVisible();
    await expect(dialog.getByText(roomNumber)).toBeVisible();

    await dialog.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('has been deleted')).toBeVisible();

    // Verify room is no longer in the table
    await expect(page.getByRole('cell', { name: roomName })).not.toBeVisible();
  });
});
