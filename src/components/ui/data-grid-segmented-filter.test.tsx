import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { DataGridSegmentedFilter } from '@/components/ui/data-grid-segmented-filter';
import { render } from '@/test-utils';

const options = [
  { value: 'success', label: 'Ready', color: 'emerald' as const },
  { value: 'error', label: 'Error', color: 'rose' as const }
];

describe('DataGridSegmentedFilter', () => {
  test('reports the picked option and clears through the All segment', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DataGridSegmentedFilter
        label="Status"
        allLabel="All statuses"
        value="success"
        onValueChange={onValueChange}
        options={options}
      />
    );

    expect(screen.getByRole('radio', { name: 'Ready' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Error' }));
    expect(onValueChange).toHaveBeenCalledWith('error');

    await user.click(screen.getByRole('radio', { name: 'All statuses' }));
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });
});
