import { Trans } from '@lingui/react/macro';
import { PlusIcon } from 'lucide-react';

import { EmptyTableState } from '@/components/empty-table-state';

interface CategoriesEmptyStateProps {
  onAddCategory: () => void;
}

export function CategoriesEmptyState({
  onAddCategory
}: CategoriesEmptyStateProps) {
  return (
    <div className="flex min-h-[140px] items-center justify-center text-center">
      <EmptyTableState
        title={<Trans>No categories yet</Trans>}
        description={
          <Trans>Create the first category to start adding products.</Trans>
        }
        action={{
          label: <Trans>Add category</Trans>,
          icon: <PlusIcon aria-hidden="true" />,
          onClick: onAddCategory,
          variant: 'outline'
        }}
      />
    </div>
  );
}
