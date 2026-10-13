import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';

import {
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlProps
} from '@/components/ui/segmented-control';

// The empty string stands in for "no filter" — Base UI needs a value per item.
const ALL_VALUE = '';

type DataGridSegmentedFilterOption<TValue extends string> =
  SegmentedControlOption<TValue>;

interface DataGridSegmentedFilterProps<TValue extends string> extends Omit<
  SegmentedControlProps<TValue>,
  'value' | 'onValueChange'
> {
  value?: TValue;
  onValueChange: (value: TValue | undefined) => void;
  allLabel?: ReactNode;
}

/**
 * A segmented control as a table filter: an "All" segment leads the options
 * and stands for no filter at all.
 */
function DataGridSegmentedFilter<TValue extends string>({
  options,
  value,
  onValueChange,
  allLabel,
  ...props
}: DataGridSegmentedFilterProps<TValue>) {
  return (
    <SegmentedControl<TValue | typeof ALL_VALUE>
      value={value ?? ALL_VALUE}
      onValueChange={(nextValue) => onValueChange(nextValue || undefined)}
      options={[
        { value: ALL_VALUE, label: allLabel ?? <Trans>All</Trans> },
        ...options
      ]}
      {...props}
    />
  );
}

export {
  DataGridSegmentedFilter,
  type DataGridSegmentedFilterOption,
  type DataGridSegmentedFilterProps
};
