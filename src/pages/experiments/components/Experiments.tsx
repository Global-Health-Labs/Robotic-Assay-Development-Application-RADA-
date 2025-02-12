import { Experiment, ExperimentFilters, PaginatedResponse } from '@/api/experiment.type';
import { getLFAExperiments } from '@/api/lfa-experiments.api';
import { getNAATExperiments } from '@/api/naat-experiments.api';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { useTableState } from '@/components/data-table/table-state';
import { SearchInput } from '@/components/experiments/search-input';
import { PageLoading } from '@/components/ui/page-loading';
import ExperimentActions from '@/pages/experiments/components/ExperimentActions';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { first } from 'lodash-es';

interface ExperimentsProps {
  type: 'NAAT' | 'LFA';
  initialFilters: ExperimentFilters;
  onFiltersChange: (type: 'NAAT' | 'LFA', filters: Partial<ExperimentFilters>) => void;
}

export const columns: ColumnDef<Experiment>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    enableSorting: true,
    cell: ({ row }) => {
      const experiment = row.original;
      return (
        <Link
          to={`/experiments/${experiment.type.toLowerCase()}/${experiment.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {experiment.name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
    enableSorting: true,
    sortingFn: 'datetime',
    cell: ({ row }) => {
      const date = new Date(row.getValue('updatedAt'));
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
  {
    accessorKey: 'ownerFullName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
    enableSorting: true,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ExperimentActions experiment={row.original} />,
  },
];

const Experiments: React.FC<ExperimentsProps> = ({ type, initialFilters, onFiltersChange }) => {
  const pagination = useTableState((state) => state.pagination);
  const setPagination = useTableState((state) => state.setPagination);
  const sorting = useTableState((state) => state.sorting);
  const setSorting = useTableState((state) => state.setSorting);
  const [filters, setFilters] = useState<ExperimentFilters>({
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
    sorting: [],
    search: initialFilters.search,
    type: type,
  });

  const filtersChanged = useCallback((newFilters: Partial<ExperimentFilters>) => {
    setFilters((prev: ExperimentFilters) => ({
      ...prev,
      ...newFilters,
    }));
    onFiltersChange(type, newFilters);
  }, []);

  useEffect(() => {
    setPagination(initialFilters.pagination);
    setSorting(initialFilters.sorting);
  }, []);

  // Synchronize pagination with filters
  useEffect(() => {
    filtersChanged({ pagination });
  }, [pagination, filtersChanged]);

  // Synchronize sorting with filters
  useEffect(() => {
    filtersChanged({ sorting });
  }, [sorting, filtersChanged]);

  const onSearchChange = (value: string) => {
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
    filtersChanged({ search: value });
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['experiments', filters],
    queryFn: () => {
      const params = new URLSearchParams();

      params.append('page', ((filters.pagination.pageIndex || 0) + 1).toString());
      params.append('perPage', filters.pagination.pageSize.toString());

      const sorting = first(filters.sorting) || { id: 'updatedAt', desc: true };
      params.append('sortBy', sorting.id);
      params.append('sortOrder', sorting.desc ? 'desc' : 'asc');
      if (filters.search && filters.search.trim().length > 0) {
        params.append('search', filters.search.trim());
      }

      if (type === 'LFA') {
        return getLFAExperiments(params) as Promise<PaginatedResponse<Experiment>>;
      }
      return getNAATExperiments(params) as Promise<PaginatedResponse<Experiment>>;
    },
    placeholderData: keepPreviousData,
  });

  // Only show loading skeleton on initial load
  if (isLoading && !isFetching) {
    return (
      <div className="py-10">
        <PageLoading />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:-translate-y-12">
      <div className="flex flex-col sm:items-end">
        <div className="flex w-2/5 items-center space-x-2">
          <SearchInput
            initialValue={filters.search || ''}
            onSearch={onSearchChange}
            placeholder={`Search ${type} experiments...`}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        totalRows={data?.meta?.total}
        manualPagination
        state={{
          sorting,
          pagination,
        }}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
      />
    </div>
  );
};

export default Experiments;
