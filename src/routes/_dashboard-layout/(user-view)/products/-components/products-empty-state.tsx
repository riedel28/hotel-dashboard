import { Trans } from '@lingui/react/macro';

export function ProductsEmptyState() {
  return (
    <div className="flex min-h-[140px] flex-col items-center justify-center gap-3">
      <div className="text-center text-sm text-pretty text-muted-foreground">
        <Trans>
          No products in this category. Add products to this category by
          clicking the button below.
        </Trans>
      </div>
    </div>
  );
}
