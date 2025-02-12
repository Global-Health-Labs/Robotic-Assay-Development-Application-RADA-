import { PaginationState, SortingState } from '@tanstack/react-table';

export type Experiment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  ownerFullName: string;
  name: string;
  type: 'LFA' | 'NAAT';
};

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  };
}

export interface ExperimentFilters {
  pagination: PaginationState;
  sorting: SortingState;
  search?: string;
  type?: 'LFA' | 'NAAT';
}
