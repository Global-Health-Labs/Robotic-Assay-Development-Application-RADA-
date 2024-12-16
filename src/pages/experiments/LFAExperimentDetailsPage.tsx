import {
  createLFAExperiment,
  getLFAExperiment,
  LFAExperiment,
  NewLFAExperiment,
  updateLFAExperiment,
} from '@/api/lfa-experiments.api';
import { LFAExperimentForm } from '@/pages/experiments/components/LFAExperimentForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'lodash-es';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function LFAExperimentDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditMode = !isEmpty(id);

  const { data: experimentData, isLoading } = useQuery({
    queryKey: ['lfa-experiment', id],
    queryFn: () => getLFAExperiment(id!),
    enabled: isEditMode,
  });

  const experimentMutation = useMutation({
    mutationFn: (data: LFAExperiment | NewLFAExperiment) => {
      const experimentData: NewLFAExperiment = {
        nameOfExperimentalPlan: data.nameOfExperimentalPlan,
        numOfSampleConcentrations: data.numOfSampleConcentrations,
        numOfTechnicalReplicates: data.numOfTechnicalReplicates,
        plateName: data.plateName,
        plateSize: data.plateSize,
        plateConfigId: data.plateConfigId,
        type: 'LFA'
      };

      if (isEditMode) {
        return updateLFAExperiment(id!, experimentData);
      } else {
        return createLFAExperiment(experimentData);
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
    }
  };

  if (isEditMode && isLoading) {
    return <div>Loading experiment data...</div>;
  }

  return (
    <div className="max-w-2xl py-4 md:py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Edit LFA Experiment' : 'Create New LFA Experiment'}
        </h2>
        <p className="text-muted-foreground">
          {isEditMode
            ? 'Modify the details of your LFA experiment'
            : 'Enter the details for your new LFA experimental plan'}
        </p>
      </div>

      <LFAExperimentForm
        mode={isEditMode ? 'edit' : 'create'}
        defaultValues={experimentData}
        onSubmit={(data, isDirty) => handleSubmit(data, isDirty)}
        isSubmitting={experimentMutation.isPending}
        onCancel={() => navigate('/experiments')}
      />
    </div>
  );
}
