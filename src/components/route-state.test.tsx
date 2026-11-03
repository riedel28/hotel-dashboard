import { screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { ApiError } from '@/api/client';
import { render } from '@/test-utils';

import { RouteError } from './route-state';

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ invalidate: () => Promise.resolve() }),
  useNavigate: () => vi.fn()
}));

describe('RouteError', () => {
  test('shows the error card for a failed load', () => {
    render(<RouteError error={new ApiError('Boom', undefined, 500)} />);
    expect(screen.getByText("Couldn't load this page")).toBeInTheDocument();
  });

  test('shows nothing when the session has ended', () => {
    const { container } = render(
      <RouteError error={new ApiError('Unauthorized', undefined, 401)} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
