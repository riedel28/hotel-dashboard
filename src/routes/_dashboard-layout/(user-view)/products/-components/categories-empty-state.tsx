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
    <div className="flex min-h-[140px] flex-col items-center justify-center gap-3 py-4">
      <div className="text-muted-foreground text-center text-sm text-pretty">
        <Trans>No categories yet. Add a category to get started.</Trans>
      </div>
      <Button variant="secondary" className="mt-1" onClick={onAddCategory}>
        <PlusCircleIcon className="mr-2 h-4 w-4" />
        <Trans>Add category</Trans>
      </Button>
    </div>
  );
}
