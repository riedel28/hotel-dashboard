import { expect, type Page, test } from '@playwright/test';

// Properties from the seed data
const PROPERTIES = {
  OVERLOOK: 'The Overlook Hotel',
  GRAND_BUDAPEST: 'The Grand Budapest Hotel',
  CONTINENTAL: 'The Continental',
  FAWLTY_TOWERS: 'Fawlty Towers',
  BATES_MOTEL: 'Bates Motel',
  TRANSYLVANIA: 'Hotel Transylvania',
  WHITE_LOTUS: 'The White Lotus',
  BERTRAMS: "Bertram's Hotel",
  DOLPHIN: 'The Dolphin Hotel',
  KELLERMANS: "Kellerman's Resort"
};

async function openPropertySelector(page: Page) {
  await page.getByLabel('Select property').click();
}

async function selectProperty(page: Page, propertyName: string) {
  await openPropertySelector(page);
  await page.getByRole('option', { name: propertyName }).click();
}

test.describe('Property Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display property selector in the header', async ({ page }) => {
    await expect(page.getByLabel('Select property')).toBeVisible();
  });

  test('should open dropdown and show available properties', async ({
    page
  }) => {
    await openPropertySelector(page);

    // Verify several properties are visible in the dropdown
    await expect(
      page.getByRole('option', { name: PROPERTIES.OVERLOOK })
    ).toBeVisible();
    await expect(
      page.getByRole('option', { name: PROPERTIES.GRAND_BUDAPEST })
    ).toBeVisible();
    await expect(
      page.getByRole('option', { name: PROPERTIES.CONTINENTAL })
    ).toBeVisible();
  });

  test('should show search input in the dropdown', async ({ page }) => {
    await openPropertySelector(page);

    await expect(page.getByPlaceholder('Search property')).toBeVisible();
  });

  test('should filter properties by search term', async ({ page }) => {
    await openPropertySelector(page);

    await page.getByPlaceholder('Search property').fill('Budapest');

    // Matching property should be visible
    await expect(
      page.getByRole('option', { name: PROPERTIES.GRAND_BUDAPEST })
    ).toBeVisible();

    // Non-matching properties should not be visible
    await expect(
      page.getByRole('option', { name: PROPERTIES.OVERLOOK })
    ).not.toBeVisible();
    await expect(
      page.getByRole('option', { name: PROPERTIES.CONTINENTAL })
    ).not.toBeVisible();
  });

  test('should show empty state when search has no matches', async ({
    page
  }) => {
    await openPropertySelector(page);

    await page.getByPlaceholder('Search property').fill('NonExistentProperty');

    await expect(page.getByText('No properties found.')).toBeVisible();
  });

  test('should select a property and show confirmation toast', async ({
    page
  }) => {
    await selectProperty(page, PROPERTIES.OVERLOOK);

    // Toast confirmation
    await expect(
      page.getByText(`Switched to ${PROPERTIES.OVERLOOK}`)
    ).toBeVisible();

    // Selected property name should be displayed in the trigger
    await expect(page.getByLabel('Select property')).toContainText(
      PROPERTIES.OVERLOOK
    );
  });

  test('should persist selected property after page reload', async ({
    page
  }) => {
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/selected-property') && resp.status() === 200
    );
    await selectProperty(page, PROPERTIES.GRAND_BUDAPEST);
    await responsePromise;

    await expect(page.getByLabel('Select property')).toContainText(
      PROPERTIES.GRAND_BUDAPEST
    );

    await page.reload();

    await expect(page.getByLabel('Select property')).toContainText(
      PROPERTIES.GRAND_BUDAPEST,
      { timeout: 10000 }
    );
  });

  test('should switch between properties', async ({ page }) => {
    // Select first property
    await selectProperty(page, PROPERTIES.OVERLOOK);
    await expect(page.getByLabel('Select property')).toContainText(
      PROPERTIES.OVERLOOK
    );

    // Switch to another property
    await selectProperty(page, PROPERTIES.FAWLTY_TOWERS);
    await expect(
      page.getByText(`Switched to ${PROPERTIES.FAWLTY_TOWERS}`)
    ).toBeVisible();
    await expect(page.getByLabel('Select property')).toContainText(
      PROPERTIES.FAWLTY_TOWERS
    );
  });

  test('should reload properties list', async ({ page }) => {
    await openPropertySelector(page);

    await page.getByRole('button', { name: 'Reload properties' }).click();

    await expect(page.getByText('Properties updated')).toBeVisible();
  });

  test('should select a property via search and selection', async ({
    page
  }) => {
    await openPropertySelector(page);

    // Type to filter
    await page.getByPlaceholder('Search property').fill('Transylvania');

    // Select from filtered results
    await page.getByRole('option', { name: PROPERTIES.TRANSYLVANIA }).click();

    await expect(
      page.getByText(`Switched to ${PROPERTIES.TRANSYLVANIA}`)
    ).toBeVisible();
    await expect(page.getByLabel('Select property')).toContainText(
      PROPERTIES.TRANSYLVANIA
    );
  });

  test('should close dropdown after selecting a property', async ({ page }) => {
    await openPropertySelector(page);

    // Dropdown content should be visible
    await expect(page.getByPlaceholder('Search property')).toBeVisible();

    await page.getByRole('option', { name: PROPERTIES.OVERLOOK }).click();

    // Dropdown should be closed
    await expect(page.getByPlaceholder('Search property')).not.toBeVisible();
  });

  test('should keep previously selected property highlighted when reopening', async ({
    page
  }) => {
    await selectProperty(page, PROPERTIES.CONTINENTAL);

    // Reopen the selector
    await openPropertySelector(page);

    // The selected option should have aria-selected
    const selectedOption = page.getByRole('option', {
      name: PROPERTIES.CONTINENTAL
    });
    await expect(selectedOption).toHaveAttribute('aria-selected', 'true');
  });
});
