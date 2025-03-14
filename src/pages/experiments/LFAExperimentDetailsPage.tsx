import {
  createLFAExperiment,
  getLFAExperiment,
  LFAExperiment,
  NewLFAExperiment,
  updateLFAExperiment,
} from '@/api/lfa-experiments.api';
import { PageLoading } from '@/components/ui/page-loading';
import { LFAExperimentForm } from '@/pages/experiments/components/LFAExperimentForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'lodash-es';
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function LFAExperimentDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const presetId = searchParams.get('preset');
  const queryClient = useQueryClient();
  const isEditMode = !isEmpty(id);

  const { data: experimentData, isLoading: experimentLoading } = useQuery({
    queryKey: ['lfa-experiment', id],
    queryFn: () => getLFAExperiment(id!),
    enabled: isEditMode,
  });

  const { data: presetData, isLoading: presetLoading } = useQuery({
    queryKey: ['lfa-experiment', presetId],
    queryFn: () => getLFAExperiment(presetId!),
    enabled: !isEditMode && !isEmpty(presetId),
  });

  const isLoading = experimentLoading || presetLoading;

  useEffect(() => {
    if (!isLoading && isEditMode && !experimentData) {
      navigate('/experiments');
    }
  }, [isEditMode, experimentData, navigate, isLoading]);

  const experimentMutation = useMutation({
    mutationFn: (data: LFAExperiment | NewLFAExperiment) => {
      const experimentData: NewLFAExperiment = {
        name: data.name,
        numReplicates: data.numReplicates,
        deckLayoutId: data.deckLayoutId,
        assayPlateConfigId: data.assayPlateConfigId,
        useAsPreset: data.useAsPreset,
        type: 'LFA',
      };

      if (data.useAsPreset) {
        queryClient.invalidateQueries({ queryKey: ['lfa-presets'] });
      }

      if (isEditMode) {
        return updateLFAExperiment(id!, experimentData);
      } else {
        return createLFAExperiment(experimentData, presetId);
      }
    },
    onSuccess: (experiment) => {
      toast.success(
        isEditMode ? 'Experiment updated successfully.' : 'Experiment created successfully.'
      );
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      queryClient.invalidateQueries({ queryKey: ['lfa-experiment', experiment.id] });
      navigate(`/experiments/lfa/${experiment.id}/steps`);
    },
    onError: () => {
      toast.error(
        isEditMode
          ? 'Failed to update experiment.'
          : 'Failed to create experiment. Please try again.'
      );
    },
  });

  const handleSubmit = (data: LFAExperiment | NewLFAExperiment, isDirty: boolean) => {
    if (isDirty) {
      experimentMutation.mutate(data);
    } else if (isEditMode) {
      navigate(`/experiments/lfa/${id}/steps`);
    } else {
      navigate('/experiments');
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  const defaultValues = isEditMode
    ? experimentData
    : presetData
      ? { ...presetData, name: '', useAsPreset: false }
      : undefined;

  return (
    <div className="max-w-2xl py-4 md:py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Edit LFA Experiment' : 'Create New LFA Experiment'}
        </h2>
        <p className="text-muted-foreground">
          {isEditMode
            ? 'Modify the details of your LFA experiment'
            : presetId
              ? 'Create a new experiment from preset'
              : 'Enter the details for your new LFA experimental plan'}
        </p>
      </div>

      <LFAExperimentForm
        mode={isEditMode ? 'edit' : 'create'}
        defaultValues={defaultValues}
        onSubmit={(data, isDirty) => handleSubmit(data, isDirty)}
        isSubmitting={experimentMutation.isPending}
        onCancel={() => navigate('/experiments')}
      />
    </div>
  );
}
