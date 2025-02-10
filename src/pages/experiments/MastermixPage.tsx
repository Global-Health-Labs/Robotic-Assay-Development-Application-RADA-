import {
  getNAATExperiment,
  getMastermix,
  Mastermix,
  updateMastermix,
} from '@/api/naat-experiments.api';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/page-loading';
import { useLiquidTypes } from '@/hooks/useLiquidTypes';
import { useVolumeUnits } from '@/hooks/useVolumeUnits';
import { MastermixTable } from '@/pages/experiments/components/MastermixTable';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function MastermixPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: experiment, isLoading: isLoadingExperiment } = useQuery({
    queryKey: ['experiment', id],
    queryFn: () => getNAATExperiment(id!),
    enabled: !!id,
  });

  const { data: mastermixData, isLoading: isLoadingMastermix } = useQuery({
    queryKey: ['mastermix', id],
    queryFn: () => getMastermix(id!),
    enabled: !!id,
  });

  const { data: liquidTypes, isLoading: liquidTypesLoading } = useLiquidTypes();
  const { data: volumeUnits, isLoading: volumeUnitsLoading } = useVolumeUnits();

  // Local state for mastermix data
  const [localMastermixes, setLocalMastermixes] = useState<Mastermix[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize local state when data is loaded
  useEffect(() => {
    if (mastermixData) {
      setLocalMastermixes(mastermixData);
    }
  }, [mastermixData]);

  const updateMastermixMutation = useMutation({
    mutationFn: (mastermixes: Mastermix[]) =>
      updateMastermix({
        experimentId: id!,
        mastermixes,
      }),
    onSuccess: () => {
      toast.success('Mastermix updated successfully');
      queryClient.invalidateQueries({ queryKey: ['mastermix', id] });
      setIsDirty(false);
      setIsSubmitted(true);
      navigate(`/experiments/naat/${id}/export`);
    },
    onError: () => {
      toast.error('Failed to update mastermix');
    },
  });

  if (isLoadingExperiment || isLoadingMastermix || liquidTypesLoading || volumeUnitsLoading) {
    return <PageLoading />;
  }

  if (!experiment) {
    return <div>Experiment not found</div>;
  }

  const handleMastermixChange = (updatedMastermixes: Mastermix[]) => {
    setLocalMastermixes(updatedMastermixes);
    // If there's a new mastermix (from cloning), scroll it into view
    if (updatedMastermixes.length > localMastermixes.length) {
      setTimeout(() => {
        const lastMastermix = document.querySelector('.mastermix-container:last-child');
        lastMastermix?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
    // Set dirty flag whenever mastermixes change
    setIsDirty(true);
  };

  const handleSave = () => {
    if (localMastermixes) {
      updateMastermixMutation.mutate(localMastermixes);
    }
  };

  const handleCancel = () => {
    // Reset to server state
    setLocalMastermixes(mastermixData || []);
    setIsDirty(false);
    navigate(`/experiments`);
  };

  const addMastermix = () => {
    const newMastermix: Mastermix = {
      id: crypto.randomUUID(),
      name: ``,
      reagents: [
        {
          id: crypto.randomUUID(),
          source: '',
          unit: volumeUnits ? volumeUnits[0].unit : '',
          finalConcentration: '' as unknown as number,
          stockConcentration: '' as unknown as number,
          liquidType: liquidTypes ? liquidTypes[0].value : '',
        },
      ],
    };

    setLocalMastermixes([...localMastermixes, newMastermix]);
    setIsDirty(true); // Set dirty flag when adding new mastermix
  };

  return (
    <div className="max-w-5xl py-4 md:py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Mastermix Setup</h2>
            <p className="text-muted-foreground">
              Configure your mastermix components and concentrations
            </p>
          </div>
          <Button onClick={addMastermix} type="button">
            Add Mastermix
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <MastermixTable
          mastermixes={localMastermixes}
          onChange={handleMastermixChange}
          onValidationChange={setIsValid}
          isSubmitted={isSubmitted}
        />

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || !isDirty || updateMastermixMutation.isPending}
          >
            {updateMastermixMutation.isPending ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
