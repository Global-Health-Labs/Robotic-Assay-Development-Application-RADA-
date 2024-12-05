import { ColumnFiltersState, OnChangeFn, SortingState, PaginationState } from '@tanstack/react-table';
import { create } from 'zustand';

type TableState = {
  columnFilters: ColumnFiltersState;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
};

export const useTableState = create<TableState>((set) => ({
  columnFilters: [],
  setColumnFilters: (appliedFilters) => {
    set((state) => {
      const newValue =
        appliedFilters instanceof Function
          ? appliedFilters(state.columnFilters)
          : appliedFilters;

      return {
        ...state,
        columnFilters: newValue,
      };
    });
  },
  sorting: [],
  setSorting: (appliedSorting) => {
    set((state) => {
      const newValue =
        appliedSorting instanceof Function ? appliedSorting(state.sorting) : appliedSorting;

      return {
        ...state,
        sorting: newValue,
      };
    });
  },
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  setPagination: (appliedPagination) => {
    set((state) => {
      const newValue =
        appliedPagination instanceof Function
          ? appliedPagination(state.pagination)
          : appliedPagination;

      return {
        ...state,
        pagination: newValue,
      };
    });
  },
}));
