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
import { LiquidType, useLiquidTypes } from '@/hooks/useLiquidTypes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type EditState = {
  id: string;
  value: string;
  displayName: string;
};

type NewState = {
  isNew: boolean;
} & EditState;

// This would come from your backend
export default function ManageLiquidTypesPage() {
  const queryClient = useQueryClient();
  const { data: liquidTypes = [], isLoading } = useLiquidTypes();
  const [editState, setEditState] = useState<EditState | null>(null);
  const [newItem, setNewItem] = useState<NewState | null>(null);

  const addMutation = useMutation({
    mutationFn: async (data: { value: string; displayName: string }) => {
      const res = await axios.post('/settings/liquid-types', data);
      return res.data;
    },
    onSuccess: (newLiquidType) => {
      queryClient.setQueryData(['liquid-types'], (oldTypes: LiquidType[] = []) => {
        return [...oldTypes, newLiquidType];
      });
      toast.success('Liquid type added successfully');
      setEditState(null);
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 409) {
        toast.error('A liquid type with this value already exists');
      } else if (error.response?.status === 400) {
        toast.error('Invalid input data');
      } else {
        toast.error('Failed to add liquid type');
        console.error('Error adding liquid type:', error);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { value: string; displayName: string };
    }) => {
      const res = await axios.put(`/settings/liquid-types/${id}`, data);
      return res.data;
    },
    onSuccess: (updatedLiquidType) => {
      queryClient.setQueryData(['liquid-types'], (oldTypes: LiquidType[] = []) => {
        return oldTypes.map((type) =>
          type.id === updatedLiquidType.id ? updatedLiquidType : type
        );
      });
      toast.success('Liquid type updated successfully');
      setEditState(null);
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 409) {
        toast.error('A liquid type with this value already exists');
      } else if (error.response?.status === 400) {
        toast.error('Invalid input data');
      } else if (error.response?.status === 404) {
        toast.error('Liquid type not found');
      } else {
        toast.error('Failed to update liquid type');
        console.error('Error updating liquid type:', error);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/settings/liquid-types/${id}`);
      return res.data;
    },
    onSuccess: (deletedLiquidType) => {
      queryClient.setQueryData(['liquid-types'], (oldTypes: LiquidType[] = []) =>
        oldTypes.filter((type) => type.id !== deletedLiquidType.id)
      );
      toast.success('Liquid type deleted successfully');
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 404) {
        toast.error('Liquid type not found');
      } else {
        toast.error('Failed to delete liquid type');
        console.error('Error deleting liquid type:', error);
      }
    },
  });

  const handleAddLiquidType = () => {
    const newId = `NEW_${Date.now()}`;
    const newType = {
      id: newId,
      value: '',
      displayName: '',
      isNew: true,
    };
    setNewItem(newType);
    setEditState({
      id: newId,
      value: '',
      displayName: '',
    });
  };

  const handleEdit = (type: EditState | NewState) => {
    setEditState({
      id: type.id,
      value: type.value,
      displayName: type.displayName,
    });
  };

  const handleCancelEdit = (type: EditState | NewState) => {
    setEditState(null);
    if ('isNew' in type) {
      setNewItem(null);
    }
  };

  const handleSaveEdit = async (type: EditState | NewState) => {
    if (!editState) return;

    const { value, displayName } = editState;

    if (!value.trim() || !displayName.trim()) {
      toast.error('Both value and display name are required');
      return;
    }

    // Check for duplicate value, excluding the current item being edited
    const isDuplicate = liquidTypes.some(
      (lt) => lt.value.toLowerCase() === value.toLowerCase() && lt.id !== type.id
    );

    if (isDuplicate) {
      toast.error('A liquid type with this value already exists');
      return;
    }

    if ('isNew' in type) {
      addMutation.mutate({ value, displayName });
    } else {
      updateMutation.mutate({ id: type.id, data: { value, displayName } });
    }
  };

  // Add real-time validation as user types
  const handleValueChange = (newValue: string) => {
    if (!editState) return;

    // Check for duplicate value in real-time, excluding the current item
    const isDuplicate = liquidTypes.some(
      (lt) => lt.value.toLowerCase() === newValue.toLowerCase() && lt.id !== editState.id
    );

    if (isDuplicate) {
      toast.error('A liquid type with this value already exists', {
        id: 'duplicate-value', // Use an ID to prevent multiple toasts
      });
    }

    setEditState((prev) => (prev ? { ...prev, value: newValue } : null));
  };

  const handleDelete = (type: EditState | NewState) => {
    deleteMutation.mutate(type.id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Liquid Types</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Manage the available liquid types for experiments.
          </p>
        </div>
        <Button onClick={handleAddLiquidType}>
          <Plus className="mr-2 h-4 w-4" />
          Add Liquid Type
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Display Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...liquidTypes, ...(newItem ? [newItem] : [])].map((type) => (
            <TableRow key={type.id}>
              <TableCell>
                {editState?.id === type.id ? (
                  <Input
                    value={editState.displayName}
                    onChange={(e) =>
                      setEditState((prev) =>
                        prev ? { ...prev, displayName: e.target.value } : null
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        handleCancelEdit(type);
                      }
                    }}
                  />
                ) : (
                  type.displayName
                )}
              </TableCell>
              <TableCell>
                {editState?.id === type.id ? (
                  <Input
                    value={editState.value}
                    onChange={(e) => handleValueChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        handleCancelEdit(type);
                      }
                    }}
                  />
                ) : (
                  type.value
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {editState?.id === type.id ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleSaveEdit(type)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleCancelEdit(type)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(type)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(type)}>
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
