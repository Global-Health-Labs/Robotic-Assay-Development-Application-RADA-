import axios from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useVolumeUnits, VolumeUnit } from '@/hooks/useVolumeUnits';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type EditState = {
  id: string;
  unit: string;
};

type NewState = {
  isNew: boolean;
} & EditState;

export default function ManageVolumeUnitsPage() {
  const queryClient = useQueryClient();

  const { data: volumeUnits = [], isLoading } = useVolumeUnits();
  const [editState, setEditState] = useState<EditState | null>(null);
  const [newItem, setNewItem] = useState<NewState | null>(null);

  const addMutation = useMutation({
    mutationFn: async (data: { unit: string }) => {
      const res = await axios.post('/settings/volume-units', data);
      return res.data;
    },
    onSuccess: (newUnit) => {
      queryClient.setQueryData(['volume-units'], (oldUnits: VolumeUnit[] = []) => {
        return [...oldUnits, newUnit];
      });
      toast.success('Volume unit added successfully');
      setNewItem(null);
      setEditState(null);
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 400) {
        toast.error('Volume unit already exists');
      } else {
        toast.error('Failed to add volume unit');
        console.error('Error adding volume unit:', error);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { unit: string } }) => {
      const res = await axios.put(`/settings/volume-units/${id}`, data);
      return res.data;
    },
    onSuccess: (updatedUnit) => {
      queryClient.setQueryData(['volume-units'], (oldUnits: VolumeUnit[] = []) => {
        return oldUnits.map((unit) => (unit.id === updatedUnit.id ? updatedUnit : unit));
      });
      toast.success('Volume unit updated successfully');
      setEditState(null);
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 400) {
        toast.error('Volume unit already exists');
      } else if (error.response?.status === 404) {
        toast.error('Volume unit not found');
      } else {
        toast.error('Failed to update volume unit');
        console.error('Error updating volume unit:', error);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/settings/volume-units/${id}`);
      return res.data;
    },
    onSuccess: (deletedUnit) => {
      queryClient.setQueryData(['volume-units'], (oldUnits: VolumeUnit[] = []) => {
        return oldUnits.filter((unit) => unit.id !== deletedUnit.id);
      });
      toast.success('Volume unit deleted successfully');
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 404) {
        toast.error('Volume unit not found');
      } else {
        toast.error('Failed to delete volume unit');
        console.error('Error deleting volume unit:', error);
      }
    },
  });

  const handleAddVolumeUnit = () => {
    const newId = `NEW_${Date.now()}`;
    const newUnit = {
      id: newId,
      unit: '',
      isNew: true,
    };
    setNewItem(newUnit);
    setEditState({
      id: newId,
      unit: '',
    });
  };

  const handleEdit = (unit: EditState | NewState) => {
    setEditState({
      id: unit.id,
      unit: unit.unit,
    });
  };

  const handleCancelEdit = (unit: EditState | NewState) => {
    setEditState(null);
    if ('isNew' in unit) {
      setNewItem(null);
    }
  };

  const handleSaveEdit = async (unit: EditState | NewState) => {
    if (!editState) return;

    const { unit: unitValue } = editState;

    if (!unitValue.trim()) {
      toast.error('Unit value is required');
      return;
    }

    // Check for duplicate value, excluding the current item being edited
    const isDuplicate = volumeUnits.some(
      (vu) => vu.unit.toLowerCase() === unitValue.toLowerCase() && vu.id !== unit.id
    );

    if (isDuplicate) {
      toast.error('This volume unit already exists');
      return;
    }

    if ('isNew' in unit) {
      addMutation.mutate({ unit: unitValue });
    } else {
      updateMutation.mutate({ id: unit.id, data: { unit: unitValue } });
    }
  };

  // Add real-time validation as user types
  const handleUnitChange = (newValue: string) => {
    if (!editState) return;

    // Check for duplicate value in real-time, excluding the current item
    const isDuplicate = volumeUnits.some(
      (vu) => vu.unit.toLowerCase() === newValue.toLowerCase() && vu.id !== editState.id
    );

    if (isDuplicate) {
      toast.error('This volume unit already exists', {
        id: 'duplicate-unit', // Use an ID to prevent multiple toasts
      });
    }

    setEditState((prev) => (prev ? { ...prev, unit: newValue } : null));
  };

  const handleDelete = (unit: EditState | NewState) => {
    deleteMutation.mutate(unit.id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Volume Units</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Manage the available volume units for experiments.
          </p>
        </div>
        <Button onClick={handleAddVolumeUnit}>
          <Plus className="mr-2 h-4 w-4" />
          Add Volume Unit
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unit</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...volumeUnits, ...(newItem ? [newItem] : [])].map((unit) => (
            <TableRow key={unit.id}>
              <TableCell>
                {editState?.id === unit.id ? (
                  <Input
                    value={editState.unit}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        handleCancelEdit(unit);
                      }
                    }}
                  />
                ) : (
                  unit.unit
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {editState?.id === unit.id ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleSaveEdit(unit)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleCancelEdit(unit)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(unit)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(unit)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
