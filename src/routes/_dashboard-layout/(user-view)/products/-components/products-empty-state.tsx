import { Trans } from '@lingui/react/macro';

import { EmptyTableState } from '@/components/empty-table-state';

export function ProductsEmptyState() {
  return (
    <div className="flex min-h-[140px] items-center justify-center text-center">
      <EmptyTableState
        title={<Trans>No products in this category</Trans>}
        description={
          <Trans>Use “Add product” above to add the first one.</Trans>
        }
      />
    </div>
  );
}

/** Before a category is picked in the tree beside it. */
export function NoCategorySelected() {
  return (
    <div className="flex min-h-[140px] items-center justify-center text-center">
      <EmptyTableState
        title={<Trans>No category selected</Trans>}
        description={
          <Trans>Pick one under Product categories to see its products.</Trans>
        }
      />
    </div>
  );
}
