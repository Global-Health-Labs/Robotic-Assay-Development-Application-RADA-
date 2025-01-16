import { createLFAConfig, getLFAConfigs, updateLFAConfig } from '@/api/lfa-settings.api';
import { Button } from '@/components/ui/button';
import { AssayPlateConfig } from '@/types/lfa.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AssayPlateConfigurationForm,
  ConfigFormValues,
} from '../components/AssayPlateConfigurationForm';

function LocationsTable({ locations }: { locations: { dx: number; dz: number }[] }) {
  if (locations.length === 0) {
    return <div className="text-sm text-muted-foreground">No locations defined</div>;
  }

  return (
    <div className="mt-4 text-sm">
      <span className="font-medium">Locations</span>
      <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-2">
        <div className="grid grid-cols-2 font-medium">
          <div>DX</div>
          <div>DZ</div>
        </div>
        <div /> {/* Empty div for alignment */}
        {locations.map((loc, index) => (
          <div key={index} className="grid grid-cols-2">
            <div>{loc.dx}</div>
            <div>{loc.dz}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AssayPlateConfigList() {
  const [editingConfig, setEditingConfig] = useState<AssayPlateConfig | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['assayPlateConfigs'],
    queryFn: getLFAConfigs,
  });

  const createMutation = useMutation({
    mutationFn: createLFAConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assayPlateConfigs'] });
      toast.success('Configuration created successfully');
      setIsAddingNew(false);
    },
    onError: (error) => {
      console.error('Failed to create configuration:', error);
      toast.error('Failed to create configuration');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, config }: { id: string; config: ConfigFormValues }) =>
      updateLFAConfig(id, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assayPlateConfigs'] });
      toast.success('Configuration updated successfully');
      setEditingConfig(null);
    },
    onError: (error) => {
      console.error('Failed to update configuration:', error);
      toast.error('Failed to update configuration');
    },
  });

  const handleSubmit = (values: ConfigFormValues) => {
    if (editingConfig) {
      updateMutation.mutate({ id: editingConfig.id, config: values });
    } else {
      createMutation.mutate(values);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAddingNew || editingConfig) {
    return (
      <AssayPlateConfigurationForm
        config={editingConfig ?? undefined}
        onSubmit={handleSubmit}
        onCancel={() => {
          setIsAddingNew(false);
          setEditingConfig(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assay Plate Configurations</h1>
        <Button onClick={() => setIsAddingNew(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Configuration
        </Button>
      </div>

      <div className="grid gap-4">
        {configs.map((config) => (
          <div
            key={config.id}
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{config.name}</h3>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
              <Button variant="outline" onClick={() => setEditingConfig(config)}>
                Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <span className="font-medium">Plate Prefix</span>
                <div>{config.assayPlatePrefix}</div>
              </div>
              <div>
                <span className="font-medium">Plates</span>
                <div>{config.numPlates}</div>
              </div>
              <div>
                <span className="font-medium">Strips</span>
                <div>{config.numStrips}</div>
              </div>
              <div>
                <span className="font-medium">Columns</span>
                <div>{config.numColumns}</div>
              </div>
            </div>
            <LocationsTable locations={config.locations} />
          </div>
        ))}
      </div>
    </div>
  );
}
