import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type RenderOptions, render } from '@testing-library/react';
import React, { type ReactElement } from 'react';
import type { Property, PropertyStage } from 'shared/types/properties';

/**
 * Custom render function that wraps components with necessary providers.
 * This follows React Testing Library's recommended pattern for custom render.
 *
 * @see https://testing-library.com/docs/react-testing-library/setup#custom-render
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <I18nProvider i18n={i18n as any}>{children}</I18nProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Override render method with our custom render
export { customRender as render };

/**
 * Creates a mock Property object for testing
 */
export const createMockProperty = (
  id: string,
  name: string,
  stage: PropertyStage,
  country_code = 'DE'
): Property => ({
  id,
  name,
  country_code,
  stage
});
