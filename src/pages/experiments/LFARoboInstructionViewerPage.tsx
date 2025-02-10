import { getLFAExperiment } from '@/api/lfa-experiments.api';
import LFAInteractiveRoboInstructionViewer from '@/components/lfa-instruction-viewer/LFAInteractiveRoboInstructionViewer';
import { CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

export default function LFARoboInstructionViewerPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: experiment,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['experiment', id],
    queryFn: () => getLFAExperiment(id!),
    enabled: !!id,
  });

  if (!id) {
    return (
      <div className="py-6">
        <h1 className="mb-6 text-2xl font-bold">Robot Instructions Viewer</h1>
        <h3 className="text-lg font-semibold">Experiment not found</h3>
        <p className="text-gray-600">Please select a valid experiment.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-6">
        <h1 className="mb-6 text-2xl font-bold">Robot Instructions Viewer</h1>
        <CircularProgress />
      </div>
    );
  }

  if (error || !experiment) {
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
        <p>Experiment: {experiment.name}</p>
      </div>
      <LFAInteractiveRoboInstructionViewer experiment={experiment} />
    </div>
  );
}
