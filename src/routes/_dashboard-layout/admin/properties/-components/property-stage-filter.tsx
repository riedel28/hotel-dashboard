import { Trans, useLingui } from '@lingui/react/macro';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface PropertyStageFilterProps {
  value?: string;
  onChange: (stage: string | null) => void;
}

const stages = [
  { value: 'production', color: 'bg-emerald-500' },
  { value: 'staging', color: 'bg-sky-500' },
  { value: 'demo', color: 'bg-indigo-500' },
  { value: 'template', color: 'bg-amber-400' }
] as const;

export function PropertyStageFilter({
  value,
  onChange
}: PropertyStageFilterProps) {
  const { t } = useLingui();

  return (
    <Select value={value ?? 'all'} onValueChange={onChange} defaultValue="all">
      <SelectTrigger className="w-full sm:w-[160px]">
        <SelectValue>
          {(val) => {
            if (!val || val === 'all') {
              return (
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-gray-500" />
                  <span>
                    <Trans>All</Trans>
                  </span>
                </span>
              );
            }
            const stage = stages.find((s) => s.value === val);
            return (
              <span className="flex items-center gap-2">
                <span
                  className={`size-1.5 rounded-full ${stage?.color ?? 'bg-gray-500'}`}
                />
                <span className="capitalize">{t(val)}</span>
              </span>
            );
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value="all">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-gray-500" />
            <span>
              <Trans>All</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="production">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>
              <Trans>Production</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="staging">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-sky-500" />
            <span>
              <Trans>Staging</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="demo">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-indigo-500" />
            <span>
              <Trans>Demo</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="template">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-amber-400" />
            <span>
              <Trans>Template</Trans>
            </span>
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
