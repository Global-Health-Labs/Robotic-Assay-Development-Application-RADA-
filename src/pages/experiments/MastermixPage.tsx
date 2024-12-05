import { getExperiment, getMastermix, Mastermix, updateMastermix } from '@/api/experiments.api';
import { Button } from '@/components/ui/button';
import { MastermixTable } from '@/pages/experiments/components/MastermixTable';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function MastermixPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: experiment, isLoading: isLoadingExperiment } = useQuery({
    queryKey: ['experiment', id],
    queryFn: () => getExperiment(id!),
    enabled: !!id,
  });

  const { data: mastermixData, isLoading: isLoadingMastermix } = useQuery({
    queryKey: ['mastermix', id],
    queryFn: () => getMastermix(id!),
    enabled: !!id,
  });

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
    },
    onError: () => {
      toast.error('Failed to update mastermix');
    },
  });

  if (isLoadingExperiment || isLoadingMastermix) {
    return <div>Loading...</div>;
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
    if (isDirty) {
      // Reset to server state
      setLocalMastermixes(mastermixData || []);
      setIsDirty(false);
    }
  };

  const addMastermix = () => {
    const newMastermix: Mastermix = {
      id: crypto.randomUUID(),
      name: ``,
      reagents: [
        {
          id: crypto.randomUUID(),
          source: '',
          unit: 'µL',
          /* eslint-disable @typescript-eslint/no-explicit-any */
          finalConcentration: '' as any,
          stockConcentration: '' as any,
          /* eslint-enable @typescript-eslint/no-explicit-any */
          liquidType: 'Water',
        },
      ],
    };

    setLocalMastermixes([...localMastermixes, newMastermix]);
    setIsDirty(true); // Set dirty flag when adding new mastermix
  };

  console.log('isDirty:', isDirty, 'isValid:', isValid);

  return (
    <div className="py-10">
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
          <Button variant="outline" onClick={handleCancel} disabled={!isDirty}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || !isDirty || updateMastermixMutation.isPending}
          >
            {updateMastermixMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
