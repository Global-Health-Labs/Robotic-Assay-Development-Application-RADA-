import { getNAATExperiment } from '@/api/naat-experiments.api';
import { GenerateWorklistFiles } from '@/components/experiments/generate-worklist-files';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

export default function NAATExperimentExportPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: experiment,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['experiment', id],
    queryFn: () => getNAATExperiment(id!),
    enabled: !!id,
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col space-y-8 py-4 md:py-10">
        <div className="flex flex-col space-y-6">
          <div>
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="mt-2 h-4 w-[300px]" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="flex h-full flex-1 flex-col space-y-8 py-4 md:py-10">
        <div className="text-red-500">
          Error loading experiment: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  // Handle case where experiment is undefined
  if (!experiment) {
    return (
      <div className="flex h-full flex-1 flex-col space-y-8 py-4 md:py-10">
        <div className="text-muted-foreground">No experiment data found</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 py-4 md:py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Export Experiment</h2>
          <p className="text-muted-foreground">Generate worklist files for {experiment.name}</p>
        </div>
      </div>
      <GenerateWorklistFiles experiment={[experiment]} mastermixes={experiment.mastermixes} />
    </div>
  );
}
