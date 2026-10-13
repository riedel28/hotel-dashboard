import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { SegmentedControl } from '@/components/ui/segmented-control';
import { render } from '@/test-utils';

describe('SegmentedControl', () => {
  test('offers exactly its options and reports the picked one', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <SegmentedControl
        label="Mode"
        value="merge"
        onValueChange={onValueChange}
        options={[
          { value: 'merge', label: 'Merge' },
          { value: 'replace', label: 'Replace all' }
        ]}
      />
    );

    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.getByRole('radio', { name: 'Merge' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Replace all' }));
    expect(onValueChange).toHaveBeenCalledWith('replace');
  });
});
