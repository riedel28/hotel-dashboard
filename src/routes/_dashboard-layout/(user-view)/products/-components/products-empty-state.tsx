import { Trans } from '@lingui/react/macro';

export function ProductsEmptyState() {
  return (
    <div className="flex min-h-[140px] flex-col items-center justify-center gap-3">
      <div className="text-muted-foreground text-center text-sm text-pretty">
        <Trans>
          No products in this category. Add products to this category by
          clicking the button below.
        </Trans>
      </div>
    </div>
  );
}

