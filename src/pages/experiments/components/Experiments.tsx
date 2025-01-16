import { Experiment, ExperimentFilters, PaginatedResponse } from '@/api/experiment.type';
import { getLFAExperiments, LFAExperiment } from '@/api/lfa-experiments.api';
import { getNAATExperiments, NAATExperiment } from '@/api/naat-experiments.api';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { useTableState } from '@/components/data-table/table-state';
import { SearchInput } from '@/components/experiments/search-input';
import { PageLoading } from '@/components/ui/page-loading';
import ExperimentActions from '@/pages/experiments/components/ExperimentActions';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

interface ExperimentsProps {
  type: 'NAAT' | 'LFA';
}

export const columns: ColumnDef<Experiment>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    enableSorting: true,
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
  // {
  //   accessorKey: 'numOfSampleConcentrations',
  //   header: ({ column }) => (
  //     <div className="hidden lg:block">
  //       <DataTableColumnHeader column={column} title="Number of Samples" />
  //     </div>
  //   ),
  //   enableSorting: false,
  //   cell: ({ row }) => (
  //     <div className="hidden lg:block">{row.getValue('numOfSampleConcentrations')}</div>
  //   ),
  // },
  // {
  //   accessorKey: 'numOfTechnicalReplicates',
  //   header: ({ column }) => (
  //     <div className="hidden lg:block">
  //       <DataTableColumnHeader column={column} title="Technical Replicates" />
  //     </div>
  //   ),
  //   enableSorting: false,
  //   cell: ({ row }) => (
  //     <div className="hidden lg:block">{row.getValue('numOfTechnicalReplicates')}</div>
  //   ),
  // },
  // {
  //   accessorKey: 'mastermixVolumePerReaction',
  //   header: ({ column }) => (
  //     <div className="hidden lg:block">
  //       <DataTableColumnHeader column={column} title="Mastermix Volume (µL)" />
  //     </div>
  //   ),
  //   enableSorting: false,
  //   cell: ({ row }) => (
  //     <div className="hidden lg:block">{row.getValue('mastermixVolumePerReaction')}</div>
  //   ),
  // },
  // {
  //   accessorKey: 'sampleVolumePerReaction',
  //   header: ({ column }) => (
  //     <div className="hidden lg:block">
  //       <DataTableColumnHeader column={column} title="Sample Volume (µL)" />
  //     </div>
  //   ),
  //   enableSorting: false,
  //   cell: ({ row }) => (
  //     <div className="hidden lg:block">{row.getValue('sampleVolumePerReaction')}</div>
  //   ),
  // },
  // {
  //   accessorKey: 'pcrPlateSize',
  //   header: ({ column }) => (
  //     <div className="hidden lg:block">
  //       <DataTableColumnHeader column={column} title="PCR Plate Size" />
  //     </div>
  //   ),
  //   enableSorting: false,
  //   cell: ({ row }) => <div className="hidden lg:block">{row.getValue('pcrPlateSize')}</div>,
  // },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ExperimentActions experiment={row.original} />,
  },
];

const Experiments: React.FC<ExperimentsProps> = ({ type }) => {
  const pagination = useTableState((state) => state.pagination);
  const setPagination = useTableState((state) => state.setPagination);
  const sorting = useTableState((state) => state.sorting);
  const setSorting = useTableState((state) => state.setSorting);
  const [filters, setFilters] = useState<ExperimentFilters>({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    search: '',
    type: type,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['experiments', filters],
    queryFn: () => {
      if (type === 'LFA') {
        return getLFAExperiments(filters) as Promise<PaginatedResponse<Experiment>>;
      }
      return getNAATExperiments(filters) as Promise<PaginatedResponse<Experiment>>;
    },
    placeholderData: keepPreviousData,
  });

  // Synchronize pagination with filters
  useEffect(() => {
    setFilters((prev: ExperimentFilters) => ({
      ...prev,
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
    }));
  }, [pagination]);

  // Synchronize sorting with filters
  useEffect(() => {
    if (sorting.length > 0) {
      setFilters((prev: ExperimentFilters) => ({
        ...prev,
        sortBy: sorting[0].id,
        sortOrder: sorting[0].desc ? 'desc' : 'asc',
      }));
    } else {
      setFilters((prev: ExperimentFilters) => ({
        ...prev,
        sortBy: undefined,
        sortOrder: undefined,
      }));
    }
  }, [sorting]);

  const onSearchChange = (value: string) => {
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
    setFilters((prev: ExperimentFilters) => ({ ...prev, search: value }));
  };

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
