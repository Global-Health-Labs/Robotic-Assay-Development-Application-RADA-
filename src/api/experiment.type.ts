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
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  type?: 'LFA' | 'NAAT';
}
