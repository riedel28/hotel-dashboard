import { Trans } from '@lingui/react/macro';
import { type RowData } from '@tanstack/react-table';
import { cloneElement, type ReactElement } from 'react';

import { type DataGridTableInstance } from '@/components/ui/data-grid';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

function DataGridColumnVisibility<TData extends RowData>({
  table,
  trigger
}: {
  table: DataGridTableInstance<TData>;
  trigger: ReactElement;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={(props) => cloneElement(trigger, props)} />
      <DropdownMenuContent align="end" className="min-w-[150px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-medium">
            <Trans>Toggle Columns</Trans>
          </DropdownMenuLabel>
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== 'undefined' && column.getCanHide()
            )
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.columnDef.meta?.headerTitle || column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { DataGridColumnVisibility };
