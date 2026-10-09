import { Trans, useLingui } from '@lingui/react/macro';
import type { PropertyOption } from 'shared/types/properties';

import {
  DataGridCheckboxFilter,
  DataGridCheckboxFilterClear,
  DataGridCheckboxFilterFooter
} from '@/components/ui/data-grid-checkbox-filter';

import { propertyOptionLabels, propertyOptions } from './property-options';

interface PropertyOptionsFilterProps {
  value: PropertyOption[];
  onChange: (options: PropertyOption[]) => void;
}

export function PropertyOptionsFilter({
  value,
  onChange
}: PropertyOptionsFilterProps) {
  const { t } = useLingui();

  return (
    <DataGridCheckboxFilter
      label={<Trans>Solutions</Trans>}
      placeholder={<Trans>All solutions</Trans>}
      options={propertyOptions.map((option) => ({
        value: option,
        label: t(propertyOptionLabels[option])
      }))}
      value={value}
      onValueChange={onChange}
      // min-w-0 lets a long selection truncate instead of widening the trigger.
      className="w-full min-w-0 sm:w-[260px]"
    >
      <DataGridCheckboxFilterFooter>
        <DataGridCheckboxFilterClear>
          <Trans>Reset</Trans>
        </DataGridCheckboxFilterClear>
      </DataGridCheckboxFilterFooter>
    </DataGridCheckboxFilter>
  );
}
