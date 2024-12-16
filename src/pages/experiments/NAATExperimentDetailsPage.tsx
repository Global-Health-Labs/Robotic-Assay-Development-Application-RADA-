import {
  createExperiment,
  Experiment,
  getExperiment,
  NewExperiment,
  updateExperiment,
} from '@/api/naat-experiments.api';
import { PageLoading } from '@/components/ui/page-loading';
import { NAATExperimentForm } from '@/pages/experiments/components/NAATExperimentForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'lodash-es';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function NAATExperimentDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditMode = !isEmpty(id);

  const { data: experimentData, isLoading } = useQuery({
    queryKey: ['experiment', id],
    queryFn: () => getExperiment(id!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (!isLoading && isEditMode && !experimentData) {
      navigate('/experiments');
    }
  }, [isEditMode, experimentData, navigate, isLoading]);

  const experimentMutation = useMutation({
    mutationFn: (data: Experiment | NewExperiment) => {
      if (isEditMode) {
        return updateExperiment(id!, {
          nameOfExperimentalPlan: data.nameOfExperimentalPlan,
          numOfSampleConcentrations: data.numOfSampleConcentrations,
          numOfTechnicalReplicates: data.numOfTechnicalReplicates,
          mastermixVolumePerReaction: data.mastermixVolumePerReaction,
          sampleVolumePerReaction: data.sampleVolumePerReaction,
          pcrPlateSize: data.pcrPlateSize,
          deckLayoutId: data.deckLayoutId,
        });
      } else {
        return createExperiment({
          nameOfExperimentalPlan: data.nameOfExperimentalPlan,
          numOfSampleConcentrations: data.numOfSampleConcentrations,
          numOfTechnicalReplicates: data.numOfTechnicalReplicates,
          mastermixVolumePerReaction: data.mastermixVolumePerReaction,
          sampleVolumePerReaction: data.sampleVolumePerReaction,
          pcrPlateSize: data.pcrPlateSize,
          deckLayoutId: data.deckLayoutId,
        });
      }
    },
    onSuccess: (experiment) => {
      toast.success(
        isEditMode ? 'Experiment updated successfully.' : 'Experiment created successfully.'
      );
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ['experiment', experiment.id] });
      }
      navigate(`/experiments/naat/${experiment.id}/mastermix`);
    },
    onError: () => {
      toast.error(
        isEditMode
          ? 'Failed to update experiment.'
          : 'Failed to create experiment. Please try again.'
      );
    },
  });

  const handleSubmit = (data: Experiment | NewExperiment, isDirty: boolean) => {
    if (isDirty) {
      experimentMutation.mutate(data);
    } else if (isEditMode) {
      navigate(`/experiments/naat/${id}/mastermix`);
    }
  };

  if (isEditMode && isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="max-w-2xl py-4 md:py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Edit Experiment' : 'Create New Experiment'}
        </h2>
        <p className="text-muted-foreground">
          {isEditMode
            ? 'Modify the details of your experiment'
            : 'Enter the details for your new experimental plan'}
        </p>
      </div>

      <NAATExperimentForm
        mode={isEditMode ? 'edit' : 'create'}
        defaultValues={experimentData}
        onSubmit={(data, isDirty) => handleSubmit(data, isDirty)}
        isSubmitting={experimentMutation.isPending}
        onCancel={() => navigate('/experiments')}
      />
    </div>
  );
}
