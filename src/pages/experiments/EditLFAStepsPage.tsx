import {
  getLFAExperimentQueryKey,
  LFAStep,
  updateLFAExperimentSteps,
  useLFAExperiment,
} from '@/api/lfa-experiments.api';
import { LFAStepsForm } from '@/pages/experiments/components/LFAStepsForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function EditLFAStepsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: experimentData, isLoading } = useLFAExperiment(id!);

  useEffect(() => {
    if (!isLoading && !experimentData) {
      navigate('/experiments');

      toast.error('Experiment not found');
    }
  }, [experimentData, navigate, isLoading]);

  const mutation = useMutation({
    mutationFn: (steps: LFAStep[]) => updateLFAExperimentSteps(id!, steps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getLFAExperimentQueryKey(id!) });
      toast.success('Steps saved successfully');
      navigate(`/experiments/lfa/${id}/export`);
    },
    onError: (error) => {
      console.error('Failed to save steps:', error);
      toast.error('Failed to save steps');
    },
  });

  const handleSubmit = async (values: { steps: LFAStep[] }) => {
    mutation.mutate(values.steps);
  };

  const handleBack = () => {
    navigate(`/experiments/lfa/${id}`);
  };

  return (
    <div className="max-w-5xl py-4 md:py-10">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Configure LFA Experiment Steps</h1>
            <p className="text-muted-foreground">
              Define the steps for experiment: {experimentData?.name}
            </p>
          </div>

          {experimentData && (
            <LFAStepsForm
              onSubmit={handleSubmit}
              onBack={handleBack}
              experimentId={experimentData.id}
            />
          )}
        </div>
      )}
    </div>
  );
}
