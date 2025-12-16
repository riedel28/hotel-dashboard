import { test, expect, beforeEach, describe, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, createMockProperty } from '@/test-utils';
import PropertySelector from './property-selector';

// Mock sonner toast
const mockToastInfo = vi.fn();
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastWarning = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    info: (...args: unknown[]) => mockToastInfo(...args),
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
    warning: (...args: unknown[]) => mockToastWarning(...args)
  }
}));

const mockToast = {
  info: mockToastInfo,
  error: mockToastError,
  success: mockToastSuccess,
  warning: mockToastWarning
};

describe('PropertySelector', () => {
  beforeEach(() => {
    mockToast.info.mockClear();
    mockToast.error.mockClear();
    mockToast.success.mockClear();
    mockToast.warning.mockClear();
  });

  describe('Rendering', () => {
    test('renders with empty properties list', () => {
      render(<PropertySelector properties={[]} />);
      expect(screen.getByLabelText(/select property/i)).toBeInTheDocument();
    });

    test('renders placeholder when no property is selected', () => {
      render(<PropertySelector properties={[]} />);
      expect(screen.getByText(/select property/i)).toBeInTheDocument();
    });

    test('renders selected property name', () => {
      const properties = [createMockProperty('1', 'Test Hotel', 'production')];
      render(<PropertySelector properties={properties} value="1" />);
      expect(screen.getByText('Test Hotel')).toBeInTheDocument();
    });

    test('renders with multiple properties', () => {
      const properties = [
        createMockProperty('1', 'Hotel A', 'production'),
        createMockProperty('2', 'Hotel B', 'staging'),
        createMockProperty('3', 'Hotel C', 'demo')
      ];
      render(<PropertySelector properties={properties} />);
      expect(screen.getByLabelText(/select property/i)).toBeInTheDocument();
    });
  });

  describe('Property Selection', () => {
    test('calls onValueChange when property is selected', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();
      const properties = [
        createMockProperty('1', 'Hotel A', 'production'),
        createMockProperty('2', 'Hotel B', 'staging')
      ];

      render(
        <PropertySelector
          properties={properties}
          onValueChange={handleValueChange}
        />
      );

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      // Wait for combobox to open and find property item
      await waitFor(() => {
        expect(screen.getByText('Hotel A')).toBeInTheDocument();
      });

      const hotelA = screen.getByText('Hotel A');
      await user.click(hotelA);

      await waitFor(() => {
        expect(handleValueChange).toHaveBeenCalledWith('1');
      });
    });

    test('updates internal state when no onValueChange is provided', async () => {
      const user = userEvent.setup();
      const properties = [createMockProperty('1', 'Hotel A', 'production')];

      const { rerender } = render(<PropertySelector properties={properties} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Hotel A')).toBeInTheDocument();
      });

      const hotelA = screen.getByText('Hotel A');
      await user.click(hotelA);

      // Rerender to see the updated state
      rerender(<PropertySelector properties={properties} />);

      await waitFor(() => {
        expect(screen.getByText('Hotel A')).toBeInTheDocument();
      });
    });

    test('shows toast notification when property is selected', async () => {
      const user = userEvent.setup();
      const properties = [createMockProperty('1', 'Hotel A', 'production')];

      render(
        <PropertySelector properties={properties} onValueChange={vi.fn()} />
      );

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Hotel A')).toBeInTheDocument();
      });

      const hotelA = screen.getByText('Hotel A');
      await user.click(hotelA);

      await waitFor(() => {
        expect(mockToast.info).toHaveBeenCalled();
      });
    });
  });

  describe('Property Name Truncation', () => {
    test('truncates long property names in trigger', () => {
      const longName = 'A'.repeat(50);
      const properties = [createMockProperty('1', longName, 'production')];

      render(<PropertySelector properties={properties} value="1" />);

      // The component truncates to 40 characters, so we should see "A" repeated 40 times + "..."
      const expectedTruncated = `${'A'.repeat(40)}...`;
      const trigger = screen.getByLabelText(/select property/i);

      // Check that the trigger contains the truncated text
      expect(trigger).toHaveTextContent(expectedTruncated);
    });

    test('does not truncate short property names', () => {
      const shortName = 'Hotel A';
      const properties = [createMockProperty('1', shortName, 'production')];

      render(<PropertySelector properties={properties} value="1" />);

      expect(screen.getByText(shortName)).toBeInTheDocument();
    });
  });

  describe('Stage Badges', () => {
    test('renders stage badge for production property', async () => {
      const user = userEvent.setup();
      const properties = [createMockProperty('1', 'Hotel A', 'production')];

      render(<PropertySelector properties={properties} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      await waitFor(() => {
        const badge = screen.getByText(/production/i);
        expect(badge).toBeInTheDocument();
      });
    });

    test('renders stage badge for staging property', async () => {
      const user = userEvent.setup();
      const properties = [createMockProperty('1', 'Hotel A', 'staging')];

      render(<PropertySelector properties={properties} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      await waitFor(() => {
        const badge = screen.getByText(/staging/i);
        expect(badge).toBeInTheDocument();
      });
    });

    test('renders stage badge for demo property', async () => {
      const user = userEvent.setup();
      const properties = [createMockProperty('1', 'Hotel A', 'demo')];

      render(<PropertySelector properties={properties} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      await waitFor(() => {
        const badge = screen.getByText(/demo/i);
        expect(badge).toBeInTheDocument();
      });
    });

    test('renders stage badge for template property', async () => {
      const user = userEvent.setup();
      const properties = [createMockProperty('1', 'Hotel A', 'template')];

      render(<PropertySelector properties={properties} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      await waitFor(() => {
        const badge = screen.getByText(/template/i);
        expect(badge).toBeInTheDocument();
      });
    });
  });

  describe('Reload Functionality', () => {
    test('renders reload button', async () => {
      const user = userEvent.setup();
      render(<PropertySelector properties={[]} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      // Wait for combobox to open
      await waitFor(() => {
        expect(screen.getByLabelText(/reload properties/i)).toBeInTheDocument();
      });
    });

    test('calls onReload when reload button is clicked', async () => {
      const user = userEvent.setup();
      const handleReload = vi.fn<() => Promise<void>>(async () => {
        // Reload handler
      });

      render(<PropertySelector properties={[]} onReload={handleReload} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      // Wait for combobox to open
      await waitFor(() => {
        expect(screen.getByLabelText(/reload properties/i)).toBeInTheDocument();
      });

      const reloadButton = screen.getByLabelText(/reload properties/i);
      await user.click(reloadButton);

      await waitFor(() => {
        expect(handleReload).toHaveBeenCalled();
      });
    });

    test('shows loading state during reload', async () => {
      const user = userEvent.setup();
      const handleReload = vi.fn<() => Promise<void>>(
        () => new Promise<void>((resolve) => setTimeout(resolve, 100))
      );

      render(<PropertySelector properties={[]} onReload={handleReload} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      // Wait for combobox to open
      await waitFor(() => {
        expect(screen.getByLabelText(/reload properties/i)).toBeInTheDocument();
      });

      const reloadButton = screen.getByLabelText(/reload properties/i);
      await user.click(reloadButton);

      // Check for loading state
      await waitFor(() => {
        expect(screen.getByText(/loading properties/i)).toBeInTheDocument();
      });
    });

    test('disables reload button during loading', async () => {
      const user = userEvent.setup();
      const handleReload = vi.fn<() => Promise<void>>(
        () => new Promise<void>((resolve) => setTimeout(resolve, 100))
      );

      render(<PropertySelector properties={[]} onReload={handleReload} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      // Wait for combobox to open
      await waitFor(() => {
        expect(screen.getByLabelText(/reload properties/i)).toBeInTheDocument();
      });

      const reloadButton = screen.getByLabelText(/reload properties/i);
      await user.click(reloadButton);

      await waitFor(() => {
        expect(reloadButton).toBeDisabled();
      });
    });

    test('shows toast on reload completion', async () => {
      const user = userEvent.setup();
      const handleReload = vi.fn<() => Promise<void>>(async () => {
        // Reload handler
      });

      render(<PropertySelector properties={[]} onReload={handleReload} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      // Wait for combobox to open
      await waitFor(() => {
        expect(screen.getByLabelText(/reload properties/i)).toBeInTheDocument();
      });

      const reloadButton = screen.getByLabelText(/reload properties/i);
      await user.click(reloadButton);

      // Wait for reload to complete and toast to be called
      await waitFor(
        () => {
          expect(handleReload).toHaveBeenCalled();
          expect(mockToast.info).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      // Verify the toast was called with the correct message
      expect(mockToast.info).toHaveBeenCalledWith(
        expect.stringContaining('Properties updated')
      );
    });

    test('shows error toast when reload fails', async () => {
      const user = userEvent.setup();
      const handleReload = vi.fn(async () => {
        throw new Error('Reload failed');
      });

      render(<PropertySelector properties={[]} onReload={handleReload} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      // Wait for combobox to open
      await waitFor(() => {
        expect(screen.getByLabelText(/reload properties/i)).toBeInTheDocument();
      });

      const reloadButton = screen.getByLabelText(/reload properties/i);
      await user.click(reloadButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
      });
    });

    test('uses default timeout when onReload is not provided', async () => {
      const user = userEvent.setup();

      render(<PropertySelector properties={[]} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      // Wait for combobox to open
      await waitFor(() => {
        expect(screen.getByLabelText(/reload properties/i)).toBeInTheDocument();
      });

      const reloadButton = screen.getByLabelText(/reload properties/i);
      await user.click(reloadButton);

      // Wait for the default timeout (2000ms) to complete and toast to be called
      await waitFor(
        () => {
          expect(mockToast.info).toHaveBeenCalledWith(
            expect.stringContaining('Properties updated')
          );
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    test('works in controlled mode with value prop', () => {
      const properties = [
        createMockProperty('1', 'Hotel A', 'production'),
        createMockProperty('2', 'Hotel B', 'staging')
      ];

      const { rerender } = render(
        <PropertySelector properties={properties} value="1" />
      );

      expect(screen.getByText('Hotel A')).toBeInTheDocument();

      rerender(<PropertySelector properties={properties} value="2" />);

      expect(screen.getByText('Hotel B')).toBeInTheDocument();
    });

    test('works in uncontrolled mode without value prop', async () => {
      const user = userEvent.setup();
      const properties = [createMockProperty('1', 'Hotel A', 'production')];

      render(<PropertySelector properties={properties} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Hotel A')).toBeInTheDocument();
      });

      const hotelA = screen.getByText('Hotel A');
      await user.click(hotelA);

      // In uncontrolled mode, the component should update its internal state
      await waitFor(() => {
        expect(screen.queryByText(/select property/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    test('shows empty message when no properties match search', async () => {
      const user = userEvent.setup();
      const properties = [createMockProperty('1', 'Hotel A', 'production')];

      render(<PropertySelector properties={properties} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search property/i);
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search property/i);
      await user.type(searchInput, 'NonExistentHotel');

      await waitFor(() => {
        expect(screen.getByText(/no properties found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper aria-label on trigger', () => {
      render(<PropertySelector properties={[]} />);
      expect(screen.getByLabelText(/select property/i)).toBeInTheDocument();
    });

    test('has proper aria-label on reload button', async () => {
      const user = userEvent.setup();
      render(<PropertySelector properties={[]} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      // Wait for combobox to open
      await waitFor(() => {
        expect(screen.getByLabelText(/reload properties/i)).toBeInTheDocument();
      });
    });

    test('has proper aria-live region for loading state', async () => {
      const user = userEvent.setup();
      const handleReload = vi.fn<() => Promise<void>>(
        () => new Promise<void>((resolve) => setTimeout(resolve, 100))
      );

      render(<PropertySelector properties={[]} onReload={handleReload} />);

      const trigger = screen.getByLabelText(/select property/i);
      await user.click(trigger);

      // Wait for combobox to open
      await waitFor(() => {
        expect(screen.getByLabelText(/reload properties/i)).toBeInTheDocument();
      });

      const reloadButton = screen.getByLabelText(/reload properties/i);
      await user.click(reloadButton);

      await waitFor(() => {
        const liveRegion = screen.getByText(/loading properties/i);
        expect(liveRegion).toHaveAttribute('aria-live', 'polite');
        expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      });
    });
  });
});
