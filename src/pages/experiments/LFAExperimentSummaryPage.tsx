import { PageLoading } from '@/components/ui/page-loading';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getLFAExperiment } from '@/api/lfa-experiments.api';
import ExperimentActions from '@/pages/experiments/components/ExperimentActions';
import LFAExperimentSummary from '@/pages/experiments/components/LFAExperimentSummary';

export default function LFAExperimentSummaryPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: experimentData, isLoading } = useQuery({
    queryKey: ['experiment', id],
    queryFn: () => getLFAExperiment(id!),
  });

  useEffect(() => {
    if (!isLoading && !experimentData) {
      navigate('/experiments');
    }
  }, [experimentData, navigate, isLoading]);

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="max-w-4xl py-4 md:py-10">
      <div className="mb-8 flex w-full items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{experimentData?.name}</h2>
          <p className="text-muted-foreground">Experiment Summary</p>
        </div>
        <ExperimentActions experiment={experimentData!} />
      </div>

      <LFAExperimentSummary experiment={experimentData!} />
    </div>
  );
}
