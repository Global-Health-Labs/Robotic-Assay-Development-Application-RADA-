import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getNAATExperiment } from '@/api/naat-experiments.api';
import InteractiveRoboInstructionViewer from '@/components/naat-instruction-viewer/NAATInteractiveRoboInstructionViewer';
import { CircularProgress } from '@mui/material';

export default function NAATRoboInstructionViewerPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: experiment,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['experiment', id],
    queryFn: () => getNAATExperiment(id!),
    enabled: !!id,
  });

  if (!id) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="mb-6 text-2xl font-bold">Robot Instructions Viewer</h1>
        <h3 className="text-lg font-semibold">Experiment not found</h3>
        <p className="text-gray-600">Please select a valid experiment.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex flex-col items-center py-6">
        <h1 className="mb-6 text-2xl font-bold">Robot Instructions Viewer</h1>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 md:py-10">
        <h1 className="mb-6 text-2xl font-bold">Robot Instructions Viewer</h1>
        <h3 className="text-lg font-semibold text-red-600">Error loading experiment</h3>
        <p className="text-gray-600">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-10">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold">Robot Instructions Viewer</h1>
        <p>Experiment: {experiment?.name}</p>
      </div>
      {experiment && <InteractiveRoboInstructionViewer experiment={experiment} />}
    </div>
  );
}
