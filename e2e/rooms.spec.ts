import { expect, type Page, test } from '@playwright/test';

import { resetDatabase } from './helpers/reset-db';

const TEST_PROPERTY_NAME = 'Bates Motel';

async function selectProperty(page: Page) {
  const responsePromise = page.waitForResponse(
    (resp) => resp.url().includes('/selected-property') && resp.status() === 200
  );
  await page.getByLabel('Select property').click();
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

  // Creates a room through the drawer and returns its number
  async function createRoom(page: Page, roomName: string) {
    const roomNumber = `E2E-${Date.now()}`;
    await page.getByRole('button', { name: 'Add room' }).click();
    await expect(page.getByRole('heading', { name: 'Add room' })).toBeVisible();

    await page.getByLabel('Number').fill(roomNumber);
    await page.getByLabel('Name').fill(roomName);
    await page.getByLabel('Type').fill('Suite');

    await page.getByRole('button', { name: 'Add', exact: true }).click();

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

    await page.getByRole('button', { name: 'Add room' }).click();
    await page.getByLabel('Number').fill(roomNumber.toLowerCase());
    await page.getByLabel('Type').fill('Suite');
    await page.getByRole('button', { name: 'Add', exact: true }).click();

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
    await expect(page.getByLabel('Name')).toHaveValue(roomName);

    const updatedName = `${roomName} Updated`;
    await page.getByLabel('Name').fill(updatedName);
    await page.getByRole('button', { name: 'Update' }).click();

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
