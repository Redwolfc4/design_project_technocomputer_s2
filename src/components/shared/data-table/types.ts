import React from 'react';

/**
 * Standard Action definition for any DataTable row.
 */
export interface RowAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onSelect: (row: T) => void;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
  destructive?: boolean;
  dividerAfter?: boolean;
  shortcut?: string;
}

/**
 * Coordinate positioning for menus.
 */
export interface DataTableMenuPosition {
  x: number;
  y: number;
}

/**
 * Currently active menu state.
 */
export interface ActiveMenuState<T> {
  row: T;
  position: DataTableMenuPosition;
  triggerType: 'dropdown' | 'context_menu';
  title?: string;
}

/**
 * Props for the floating DataTableActionMenu component.
 */
export interface DataTableActionMenuProps<T> {
  isOpen: boolean;
  position: DataTableMenuPosition;
  row: T;
  title?: string;
  subtitle?: string | ((row: T) => string);
  actions: RowAction<T>[];
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * Props for DataTableRow wrapper component.
 */
export interface DataTableRowProps<T> extends React.HTMLAttributes<HTMLTableRowElement> {
  row: T;
  children: React.ReactNode;
  onRowDoubleClick?: (row: T) => void;
  onRowContextMenu?: (row: T, e: React.MouseEvent<HTMLTableRowElement>) => void;
  className?: string;
}

/**
 * Global interactions configuration passed to DataTable components.
 */
export interface DataTableInteractionsConfig<T> {
  actions?: RowAction<T>[];
  onRowDoubleClick?: (row: T) => void;
  enableContextMenu?: boolean;
  enableActionDropdown?: boolean;
  getRowId?: (row: T) => string;
  menuHeaderTitle?: string | ((row: T) => string);
  menuHeaderSubtitle?: string | ((row: T) => string);
}

/**
 * Filter option item for select / multi-select.
 */
export interface FilterOption {
  label: string;
  value: string;
  category?: string;
  badge?: string;
}

/**
 * Configuration for a single filter dropdown.
 */
export interface FilterConfig {
  id: string;
  label: string;
  type?: 'select' | 'multi-select';
  placeholder?: string;
  options: FilterOption[];
  selectedValue: string | string[];
  onChange: (value: any) => void;
  searchable?: boolean;
}

/**
 * Export options for DataTableToolbar.
 */
export interface DataTableExportOptions {
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  disabled?: boolean;
}

/**
 * Primary action button config.
 */
export interface DataTablePrimaryAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Props for the global DataTableToolbar component.
 */
export interface DataTableToolbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  totalFiltered: number;
  totalUnfiltered?: number;
  entityName?: string;
  onResetFilters?: () => void;
  isFilterActive?: boolean;
  exportOptions?: DataTableExportOptions;
  primaryAction?: DataTablePrimaryAction;
  extraActions?: React.ReactNode;
  className?: string;
}

/**
 * Props for DataTablePagination component.
 */
export interface DataTablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
  className?: string;
}

