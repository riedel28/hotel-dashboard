import { PencilIcon, Trash2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

import type { Product } from './product-tree-editor';

interface ProductsListProps {
  products: Product[];
  selectedProductId?: number | null;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsList({
  products,
  selectedProductId,
  onEdit,
  onDelete
}: ProductsListProps) {
  return (
    <ul className="grid gap-2">
      {products.map((p) => (
        <li
          key={p.id}
          className={cn(
            'border-border bg-card flex items-center justify-between rounded-md border px-3 py-1.5',
            selectedProductId === p.id && 'ring-primary ring-2'
          )}
        >
          <span className="text-sm font-medium">{p.title}</span>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Edit product"
              onClick={() => onEdit(p)}
            >
              <PencilIcon className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Delete product"
              onClick={() => onDelete(p)}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
