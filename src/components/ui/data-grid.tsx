'use client';

import {
  type ColumnFiltersState,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  type ReactTable,
  type RowData,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  type TableFeatures
} from '@tanstack/react-table';
import { createContext, type ReactNode, type Ref, useContext } from 'react';

import { cn } from '@/lib/utils';

declare module '@tanstack/react-table' {
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue
  > {
    headerTitle?: string;
    headerClassName?: string;
    cellClassName?: string;
    skeleton?: ReactNode;
    expandedContent?: (row: TData) => ReactNode;
    /**
     * Used to keep TanStack's `TValue` generic parameter "in use" for TS/IDE
     * diagnostics. You generally shouldn't set this.
     */
    __valueType?: TValue;
  }
}

// Every table goes through DataGrid, so they all share one feature set.
// Sorting and pagination are server-side, so no row-model slots are needed.
export const dataGridFeatures = tableFeatures({
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnResizingFeature,
  columnVisibilityFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature
});

export type DataGridFeatures = typeof dataGridFeatures;
export type DataGridTableInstance<TData extends RowData> = ReactTable<
  DataGridFeatures,
  TData
>;

export type DataGridApiFetchParams = {
  pageIndex: number;
  pageSize: number;
  sorting?: SortingState;
  filters?: ColumnFiltersState;
  searchQuery?: string;
};

export type DataGridApiResponse<T> = {
  data: T[];
  empty: boolean;
  pagination: {
    total: number;
    page: number;
  };
};

export interface DataGridContextProps<TData extends RowData> {
  props: DataGridProps<TData>;
  table: DataGridTableInstance<TData>;
  recordCount: number;
  isLoading: boolean;
}

export type DataGridRequestParams = {
  pageIndex: number;
  pageSize: number;
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
};

export interface DataGridRowProps {
  className?: string;
  ref?: Ref<HTMLTableRowElement>;
}

export interface DataGridProps<TData extends RowData> {
  className?: string;
  table?: DataGridTableInstance<TData>;
  recordCount: number;
  children?: ReactNode;
  onRowClick?: (row: TData) => void;
  /** Per-row additions to the body row, e.g. to mark or scroll to one. */
  getRowProps?: (row: TData) => DataGridRowProps | undefined;
  isLoading?: boolean;
  loadingMode?: 'skeleton' | 'spinner';
  skeletonRowCount?: number;
  loadingMessage?: ReactNode | string;
  emptyMessage?: ReactNode | string;
  tableLayout?: {
    dense?: boolean;
    cellBorder?: boolean;
    rowBorder?: boolean;
    rowRounded?: boolean;
    stripped?: boolean;
    headerBackground?: boolean;
    headerBorder?: boolean;
    headerSticky?: boolean;
    width?: 'auto' | 'fixed';
    columnsVisibility?: boolean;
    columnsResizable?: boolean;
    columnsPinnable?: boolean;
    columnsMovable?: boolean;
    columnsDraggable?: boolean;
    rowsDraggable?: boolean;
  };
  tableClassNames?: {
    base?: string;
    header?: string;
    headerRow?: string;
    headerSticky?: string;
    body?: string;
    bodyRow?: string;
    footer?: string;
    edgeCell?: string;
  };
}

type DataGridContextRow = Record<string, unknown>;

const DataGridContext = createContext<
  DataGridContextProps<DataGridContextRow> | undefined
>(undefined);

function useDataGrid<TData extends RowData = DataGridContextRow>() {
  const context = useContext(DataGridContext);
  if (!context) {
    throw new Error('useDataGrid must be used within a DataGridProvider');
  }
  return context as unknown as DataGridContextProps<TData>;
}

function DataGridProvider<TData extends RowData>({
  children,
  table,
  ...props
}: DataGridProps<TData> & { table: DataGridTableInstance<TData> }) {
  return (
    <DataGridContext.Provider
      value={{
        props: props as unknown as DataGridProps<DataGridContextRow>,
        table: table as unknown as DataGridTableInstance<DataGridContextRow>,
        recordCount: props.recordCount,
        isLoading: props.isLoading || false
      }}
    >
      {children}
    </DataGridContext.Provider>
  );
}

function DataGrid<TData extends RowData>({
  children,
  table,
  ...props
}: DataGridProps<TData>) {
  const defaultProps: Partial<DataGridProps<TData>> = {
    loadingMode: 'skeleton',
    tableLayout: {
      dense: false,
      cellBorder: false,
      rowBorder: true,
      rowRounded: false,
      stripped: false,
      headerSticky: false,
      headerBackground: true,
      headerBorder: true,
      width: 'fixed',
      columnsVisibility: false,
      columnsResizable: false,
      columnsPinnable: false,
      columnsMovable: false,
      columnsDraggable: false,
      rowsDraggable: false
    },
    tableClassNames: {
      base: '',
      header: '',
      headerRow: '',
      headerSticky: 'sticky top-0 z-10 bg-background/90 backdrop-blur-xs',
      body: '',
      bodyRow: '',
      footer: '',
      edgeCell: ''
    }
  };

  const mergedProps: DataGridProps<TData> = {
    ...defaultProps,
    ...props,
    tableLayout: {
      ...defaultProps.tableLayout,
      ...props.tableLayout
    },
    tableClassNames: {
      ...defaultProps.tableClassNames,
      ...props.tableClassNames
    }
  };

  // Ensure table is provided
  if (!table) {
    throw new Error('DataGrid requires a "table" prop');
  }

  return (
    <DataGridProvider table={table} {...mergedProps}>
      {children}
    </DataGridProvider>
  );
}

function DataGridContainer({
  children,
  className,
  border = true
}: {
  children: ReactNode;
  className?: string;
  border?: boolean;
}) {
  return (
    <div
      data-slot="data-grid"
      className={cn(
        'grid w-full overflow-x-auto',
        border && 'rounded-lg border border-border dark:bg-input/30',
        className
      )}
    >
      {children}
    </div>
  );
}

export { DataGrid, DataGridContainer, DataGridProvider, useDataGrid };
