import { Eye, Edit2, MoreHorizontal, FileText, Copy, Upload } from 'lucide-react';
import { Experiment, ExperimentFilters, getExperiments } from '@/api/experiments.api';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { SearchInput } from '@/components/experiments/search-input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTableState } from '@/components/data-table/table-state';
import { Link } from 'react-router-dom';

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
];

export const columns: ColumnDef<Experiment>[] = [
  {
    accessorKey: 'nameOfExperimentalPlan',
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
  {
    accessorKey: 'numOfSampleConcentrations',
    header: ({ column }) => (
      <div className="hidden lg:block">
        <DataTableColumnHeader column={column} title="Number of Samples" />
      </div>
    ),
    enableSorting: false,
    cell: ({ row }) => (
      <div className="hidden lg:block">{row.getValue('numOfSampleConcentrations')}</div>
    ),
  },
  {
    accessorKey: 'numOfTechnicalReplicates',
    header: ({ column }) => (
      <div className="hidden lg:block">
        <DataTableColumnHeader column={column} title="Technical Replicates" />
      </div>
    ),
    enableSorting: false,
    cell: ({ row }) => (
      <div className="hidden lg:block">{row.getValue('numOfTechnicalReplicates')}</div>
    ),
  },
  {
    accessorKey: 'mastermixVolumePerReaction',
    header: ({ column }) => (
      <div className="hidden lg:block">
        <DataTableColumnHeader column={column} title="Mastermix Volume (µL)" />
      </div>
    ),
    enableSorting: false,
    cell: ({ row }) => (
      <div className="hidden lg:block">{row.getValue('mastermixVolumePerReaction')}</div>
    ),
  },
  {
    accessorKey: 'sampleVolumePerReaction',
    header: ({ column }) => (
      <div className="hidden lg:block">
        <DataTableColumnHeader column={column} title="Sample Volume (µL)" />
      </div>
    ),
    enableSorting: false,
    cell: ({ row }) => (
      <div className="hidden lg:block">{row.getValue('sampleVolumePerReaction')}</div>
    ),
  },
  {
    accessorKey: 'pcrPlateSize',
    header: ({ column }) => (
      <div className="hidden lg:block">
        <DataTableColumnHeader column={column} title="PCR Plate Size" />
      </div>
    ),
    enableSorting: false,
    cell: ({ row }) => <div className="hidden lg:block">{row.getValue('pcrPlateSize')}</div>,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const navigate = useNavigate();
      const experiment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigate(`/experiments/${experiment.id}/edit`)}
              className="cursor-pointer"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Experiment
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(`/experiments/${experiment.id}/instructions`)}
              className="cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4" />
              Instruction Viewer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(`/experiments/${experiment.id}/clone`)}
              className="cursor-pointer"
            >
              <Copy className="mr-2 h-4 w-4" />
              Clone Experiment
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(`/experiments/${experiment.id}/documents`)}
              className="cursor-pointer"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Documents
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function ExperimentsPage() {
  const navigate = useNavigate();

  const pagination = useTableState((state) => state.pagination);
  const setPagination = useTableState((state) => state.setPagination);
  const sorting = useTableState((state) => state.sorting);
  const setSorting = useTableState((state) => state.setSorting);

  const [filters, setFilters] = useState<ExperimentFilters>({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    search: '',
    status: statusOptions[0].value,
  });

  // Synchronize pagination with filters
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
    }));
  }, [pagination]);

  // Synchronize sorting with filters
  useEffect(() => {
    if (sorting.length > 0) {
      setFilters((prev) => ({
        ...prev,
        sortBy: sorting[0].id,
        sortOrder: sorting[0].desc ? 'desc' : 'asc',
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        sortBy: undefined,
        sortOrder: undefined,
      }));
    }
  }, [sorting]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['experiments', filters],
    queryFn: () => getExperiments(filters),
    placeholderData: keepPreviousData,
  });

  // Only show loading skeleton on initial load
  if (isLoading && !isFetching) {
    return (
      <div className="py-10">
        <Skeleton className="h-[450px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Experiments</h2>
            <p className="text-muted-foreground">Manage and track your experimental plans</p>
          </div>
          <Link to="/experiments/new">
            <Button>New Experiment</Button>
          </Link>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <SearchInput
              initialValue={filters.search || ''}
              onSearch={(search) => {
                setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
                setFilters((prev) => ({ ...prev, search }));
              }}
              placeholder="Search experiments..."
            />
            <Select
              value={filters.status}
              onValueChange={(status) => {
                setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
                setFilters((prev) => ({ ...prev, status }));
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
    </div>
  );
}
