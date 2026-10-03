import { Trans } from '@lingui/react/macro';
import { PlusCircleIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface CategoriesEmptyStateProps {
  onAddCategory: () => void;
}

export function CategoriesEmptyState({
  onAddCategory
}: CategoriesEmptyStateProps) {
  return (
    <div className="flex min-h-[140px] flex-col items-center justify-center gap-1 text-center">
      <p className="text-sm font-medium">
        <Trans>No categories yet</Trans>
      </p>
      <p className="text-sm text-balance text-muted-foreground">
        <Trans>Create the first category to start adding products.</Trans>
      </p>
      <Button size="default" onClick={onAddCategory} className="mt-3">
        <PlusCircleIcon />
        <Trans>Add category</Trans>
      </Button>
    </div>
  );
}
