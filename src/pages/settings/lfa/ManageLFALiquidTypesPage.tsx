import {
  createLFALiquidType,
  deleteLFALiquidType,
  updateLFALiquidType,
} from '@/api/lfa-settings.api';
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
import { LFALiquidType, useLFALiquidTypes } from '@/hooks/useLFALiquidTypes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type EditState = {
  id: string;
  value: string;
  displayName: string;
  isNew?: boolean;
};

export default function ManageLFALiquidTypesPage() {
  const queryClient = useQueryClient();
  const { data: liquidTypes = [], isLoading } = useLFALiquidTypes();
  const [editState, setEditState] = useState<EditState | null>(null);

  const addMutation = useMutation({
    mutationFn: createLFALiquidType,
    onSuccess: (newLiquidType) => {
      queryClient.setQueryData(['lfa-liquid-types'], (oldTypes: LFALiquidType[] = []) => {
        return [newLiquidType, ...oldTypes];
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
    }) => updateLFALiquidType(id, data),
    onSuccess: (updatedLiquidType) => {
      queryClient.setQueryData(['lfa-liquid-types'], (oldTypes: LFALiquidType[] = []) => {
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
      await deleteLFALiquidType(id);
      return id;
    },
    onSuccess: (deletedLiquidTypeId) => {
      queryClient.setQueryData(['lfa-liquid-types'], (oldTypes: LFALiquidType[] = []) =>
        oldTypes.filter((type) => type.id !== deletedLiquidTypeId)
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
    setEditState(newType);
  };

  const handleEdit = (type: EditState) => {
    setEditState({
      id: type.id,
      value: type.value,
      displayName: type.displayName,
    });
  };

  const handleCancelEdit = () => {
    setEditState(null);
  };

  const handleSaveEdit = async () => {
    if (!editState) return;

    const { value, displayName } = editState;

    if (!value.trim() || !displayName.trim()) {
      toast.error('Both value and display name are required');
      return;
    }

    // Check for duplicate value, excluding the current item being edited
    const isDuplicate = liquidTypes.some(
      (lt) => lt.value.toLowerCase() === value.toLowerCase() && lt.id !== editState.id
    );

    if (isDuplicate) {
      toast.error('A liquid type with this value already exists');
      return;
    }

    if (editState.isNew) {
      addMutation.mutate({ value, displayName });
    } else {
      updateMutation.mutate({ id: editState.id, data: { value, displayName } });
    }
  };

  const handleValueChange = (newValue: string) => {
    if (!editState) return;

    // Check for duplicate value in real-time, excluding the current item
    const isDuplicate = liquidTypes.some(
      (lt) => lt.value.toLowerCase() === newValue.toLowerCase() && lt.id !== editState.id
    );

    if (isDuplicate) {
      toast.error('A liquid type with this value already exists', {
        id: 'duplicate-value',
      });
    }

    setEditState((prev) => (prev ? { ...prev, value: newValue } : null));
  };

  const handleDelete = (type: EditState) => {
    deleteMutation.mutate(type.id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">LFA Liquid Types</h2>
        <Button onClick={handleAddLiquidType} disabled={!!editState}>
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
          {editState?.isNew && (
            <TableRow>
              <TableCell>
                <Input
                  value={editState.displayName || ''}
                  onChange={(e) =>
                    setEditState((prev) => (prev ? { ...prev, displayName: e.target.value } : null))
                  }
                  placeholder="Enter display name"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={editState.value || ''}
                  onChange={(e) => handleValueChange(e.target.value)}
                  placeholder="Enter value"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleSaveEdit()}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleCancelEdit()}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
          {liquidTypes.map((type) => (
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
                  />
                ) : (
                  type.value
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {editState?.id === type.id ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(type)}
                        disabled={!!editState}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(type)}
                        disabled={!!editState}
                      >
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
