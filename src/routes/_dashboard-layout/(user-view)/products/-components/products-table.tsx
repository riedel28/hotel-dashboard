import { Trans, useLingui } from '@lingui/react/macro';
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';

import type { Product } from '@/api/products';
import { buttonVariants } from '@/components/ui/button';
import { CurrencyFormatter } from '@/components/ui/currency-formatter';
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

import { destructiveMenuItemClassName } from './destructive-styles';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsTable({
  products,
  onEdit,
  onDelete
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
          <TableRow key={product.id} className="hover:bg-transparent">
            <TableCell className="truncate py-2.5 font-medium">
              {product.title}
            </TableCell>
            <TableCell className="py-2.5 text-right text-muted-foreground tabular-nums">
              {product.quantity}
            </TableCell>
            <TableCell className="py-2.5 text-right tabular-nums">
              <CurrencyFormatter value={product.price} />
            </TableCell>
            <TableCell className="py-1.5 text-right">
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
                <DropdownMenuContent
                  align="end"
                  className="w-auto max-w-72 min-w-40"
                >
                  <DropdownMenuItem onClick={() => onEdit(product)}>
                    <PencilIcon className="mr-2 size-4" />
                    <Trans>Edit product</Trans>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={destructiveMenuItemClassName}
                    onClick={() => onDelete(product)}
                  >
                    <Trash2Icon className="mr-2 size-4" />
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
