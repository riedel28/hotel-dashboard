import { Trans } from '@lingui/react/macro';
import type { PropertyStage } from 'shared/types/properties';

import {
  DataGridCheckboxFilter,
  DataGridCheckboxFilterClear,
  DataGridCheckboxFilterFooter
} from '@/components/ui/data-grid-checkbox-filter';
import { StageBadge } from '@/components/ui/stage-badge';

const stages: PropertyStage[] = ['production', 'staging', 'demo', 'template'];

interface PropertyStageFilterProps {
  value: PropertyStage[];
  onChange: (stages: PropertyStage[]) => void;
}

export function PropertyStageFilter({
  value,
  onChange
}: PropertyStageFilterProps) {
  return (
    <DataGridCheckboxFilter
      label={<Trans>Stage</Trans>}
      placeholder={<Trans>All stages</Trans>}
      options={stages.map((stage) => ({
        value: stage,
        label: <StageBadge stage={stage} size="sm" />
      }))}
      value={value}
      onValueChange={onChange}
      className="w-full min-w-0 sm:w-[170px]"
    >
      <DataGridCheckboxFilterFooter>
        <DataGridCheckboxFilterClear>
          <Trans>Reset</Trans>
        </DataGridCheckboxFilterClear>
      </DataGridCheckboxFilterFooter>
    </DataGridCheckboxFilter>
  );
}
