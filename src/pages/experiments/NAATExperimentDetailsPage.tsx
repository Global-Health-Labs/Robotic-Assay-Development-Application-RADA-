import {
  createNAATExperiment,
  getNAATExperiment,
  NAATExperiment,
  NewNAATExperiment,
  updateNAATExperiment,
} from '@/api/naat-experiments.api';
import { PageLoading } from '@/components/ui/page-loading';
import { NAATExperimentForm } from '@/pages/experiments/components/NAATExperimentForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'lodash-es';
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function NAATExperimentDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const presetId = searchParams.get('preset');
  const queryClient = useQueryClient();
  const isEditMode = !isEmpty(id);

  const { data: experimentData, isLoading: experimentLoading } = useQuery({
    queryKey: ['experiment', id],
    queryFn: () => getNAATExperiment(id!),
    enabled: isEditMode,
  });

  const { data: presetData, isLoading: presetLoading } = useQuery({
    queryKey: ['experiment', presetId],
    queryFn: () => getNAATExperiment(presetId!),
    enabled: !isEditMode && !isEmpty(presetId),
  });

  const isLoading = experimentLoading || presetLoading;

  useEffect(() => {
    if (!isLoading && isEditMode && !experimentData) {
      navigate('/experiments');
    }
  }, [isEditMode, experimentData, navigate, isLoading]);

  const experimentMutation = useMutation({
    mutationFn: (data: NAATExperiment | NewNAATExperiment) => {
      const payload = {
        ...data,
        useAsPreset: data.useAsPreset,
      };

      if (data.useAsPreset) {
        queryClient.invalidateQueries({ queryKey: ['presets'] });
      }

      if (isEditMode) {
        return updateNAATExperiment(id!, payload);
      } else {
        return createNAATExperiment(payload, presetId);
      }
    },
    onSuccess: (experiment: NAATExperiment) => {
      toast.success(
        isEditMode ? 'Experiment updated successfully.' : 'Experiment created successfully.'
      );
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      queryClient.invalidateQueries({ queryKey: ['experiment', experiment.id] });
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

  const handleSubmit = (data: NAATExperiment | NewNAATExperiment, isDirty: boolean) => {
    if (isDirty) {
      experimentMutation.mutate(data);
    } else if (isEditMode) {
      navigate(`/experiments/naat/${id}/mastermix`);
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
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEditMode ? 'Edit NAAT Experiment' : 'New NAAT Experiment'}
          </h2>
          <p className="text-muted-foreground">
            {isEditMode
              ? 'Update your NAAT experiment details'
              : presetId
                ? 'Create a new experiment from preset'
                : 'Create a new NAAT experiment from scratch'}
          </p>
        </div>
      </div>

      <NAATExperimentForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={experimentMutation.isPending}
        onCancel={() => navigate('/experiments')}
        mode={isEditMode ? 'edit' : 'create'}
      />
    </div>
  );
}
