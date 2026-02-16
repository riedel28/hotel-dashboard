import { expect, type Page, test } from '@playwright/test';

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
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await selectProperty(page);
    await page.goto('/rooms');
    await expect(page.getByRole('heading', { name: 'Rooms' })).toBeVisible();
  });

  async function createRoom(page: Page, roomName: string) {
    await page.getByRole('button', { name: 'Add Room' }).click();
    await expect(
      page.getByRole('heading', { name: 'Create New Room' })
    ).toBeVisible();

    await page.getByLabel('Room Name').fill(roomName);
    await page.getByLabel('Room Number').fill(`E2E-${Date.now()}`);
    await page.getByLabel('Room Type').fill('Suite');

    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('Room created successfully')).toBeVisible();
    await expect(page.getByRole('cell', { name: roomName })).toBeVisible({
      timeout: 10_000
    });
  }

  test('should create a room via the Add Room modal', async ({ page }) => {
    const roomName = `E2E Room ${Date.now()}`;
    await createRoom(page, roomName);
  });

  test('should edit a room via the Edit page', async ({ page }) => {
    const roomName = `E2E Edit Room ${Date.now()}`;
    await createRoom(page, roomName);

    // Open row actions for the created room
    const row = page.getByRole('row').filter({ hasText: roomName });
    await row.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();

    // Verify we're on the edit page with pre-populated form
    await expect(
      page.getByRole('heading', { name: 'Edit room' })
    ).toBeVisible();
    await expect(page.getByLabel('Room Name')).toHaveValue(roomName);

    // Update the room name
    const updatedName = `${roomName} Updated`;
    await page.getByLabel('Room Name').clear();
    await page.getByLabel('Room Name').fill(updatedName);
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page.getByText('Room updated successfully')).toBeVisible();

    // Navigate back to rooms list and verify updated name
    await page.goto('/rooms');
    await expect(page.getByRole('cell', { name: updatedName })).toBeVisible();
  });

  test('should delete a room via the Delete dialog', async ({ page }) => {
    const roomName = `E2E Delete Room ${Date.now()}`;
    await createRoom(page, roomName);

    // Open row actions for the created room
    const row = page.getByRole('row').filter({ hasText: roomName });
    await row.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    // Verify confirmation dialog
    const dialog = page.getByRole('alertdialog');
    await expect(
      dialog.getByRole('heading', { name: 'Are you sure?' })
    ).toBeVisible();
    await expect(dialog.getByText(roomName)).toBeVisible();

    // Confirm deletion
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Delete' })
      .click();

    await expect(page.getByText('has been deleted')).toBeVisible();

    // Verify room is no longer in the table
    await expect(page.getByRole('cell', { name: roomName })).not.toBeVisible();
  });
});
