import { Trans, useLingui } from '@lingui/react/macro';
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';

import type { Product } from '@/api/products';
import { openRowClassName } from '@/components/details-drawer';
import { buttonVariants } from '@/components/ui/button';
import { CurrencyFormatter } from '@/components/ui/currency-formatter';
import { stopRowClick } from '@/components/ui/data-grid-cards';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  /** The product open in the drawer, marked like the other tables' rows. */
  selectedProductId?: number;
}

export function ProductsTable({
  products,
  onEdit,
  onDelete,
  selectedProductId
}: ProductsTableProps) {
  const { t } = useLingui();

  return (
    <Table borderless className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>
            <Trans>Title</Trans>
          </TableHead>
          <TableHead className="w-20 text-right">
            <Trans>Quantity</Trans>
          </TableHead>
          <TableHead className="w-20 text-right">
            <Trans>Price</Trans>
          </TableHead>
          <TableHead className="w-12">
            <span className="sr-only">
              <Trans>Actions</Trans>
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow
            key={product.id}
            data-state={
              product.id === selectedProductId ? 'selected' : undefined
            }
            className={cn(
              'cursor-pointer *:first:relative hover:bg-muted/40',
              openRowClassName
            )}
            onClick={() => onEdit(product)}
          >
            <TableCell className="truncate py-2.5 font-medium">
              {product.title}
            </TableCell>
            <TableCell className="py-2.5 text-right text-muted-foreground tabular-nums">
              {product.quantity}
            </TableCell>
            <TableCell className="py-2.5 text-right tabular-nums">
              <CurrencyFormatter value={product.price} />
            </TableCell>
            {/* The menu keeps its clicks from opening the row */}
            <TableCell className="py-1.5 text-right" onClick={stopRowClick}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={buttonVariants({
                    size: 'icon-sm',
                    variant: 'ghost'
                  })}
                  aria-label={t`Product actions`}
                >
                  <MoreHorizontalIcon className="size-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-w-72">
                  <DropdownMenuItem onClick={() => onEdit(product)}>
                    <PencilIcon />
                    <Trans>Edit product</Trans>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive-soft"
                    onClick={() => onDelete(product)}
                  >
                    <Trash2Icon />
                    <Trans>Delete product</Trans>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
