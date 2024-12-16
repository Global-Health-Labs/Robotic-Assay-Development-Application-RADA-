import { getLFAExperiment } from '@/api/lfa-experiments.api';
import { getExperiment } from '@/api/naat-experiments.api';
import { LFAStepsForm } from '@/pages/experiments/components/LFAStepsForm';
import { useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash-es';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function EditLFAStepsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !isEmpty(id);

  const { data: experimentData, isLoading } = useQuery({
    queryKey: ['experiment', id],
    queryFn: () => getLFAExperiment(id!),
    enabled: isEditMode,
  });

  const handleSubmit = async (values: any) => {
    try {
      // TODO: Add API call to save steps
      toast.success('Steps saved successfully');
      navigate(`/experiments/lfa/${id}/worklist`);
    } catch (error) {
      toast.error('Failed to save steps');
    }
  };

  const handleBack = () => {
    navigate(`/experiments/lfa/${id}`);
  };

  return (
    <div className="container mx-auto py-10">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Configure LFA Experiment Steps</h1>
            <p className="text-muted-foreground">
              Define the steps for experiment: {experimentData?.nameOfExperimentalPlan}
            </p>
          </div>

          <LFAStepsForm 
            onSubmit={handleSubmit} 
            onBack={handleBack} 
            plateConfigId={experimentData?.plateConfigId}
            steps={experimentData?.steps}
          />
        </div>
      )}
    </div>
  );
}
