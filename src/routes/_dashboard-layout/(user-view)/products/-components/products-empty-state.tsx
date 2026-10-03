import { Trans } from '@lingui/react/macro';

export function ProductsEmptyState() {
  return (
    <div className="flex min-h-[140px] flex-col items-center justify-center gap-1 text-center">
      <p className="text-sm font-medium">
        <Trans>No products in this category</Trans>
      </p>
      <p className="text-sm text-balance text-muted-foreground">
        <Trans>Use “Add product” above to add the first one.</Trans>
      </p>
    </div>
  );
}
