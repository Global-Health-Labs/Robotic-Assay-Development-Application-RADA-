import {
  CreateReagentPlate,
  ReagentPlate,
  createLFAReagentPlate,
  deleteLFAReagentPlate,
  updateLFAReagentPlate,
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
import { useLFAReagentPlates } from '@/hooks/useLFAReagentPlates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type EditState = {
  id: string;
  plate: string;
  volumeWell: number;
  numRows: number;
  numCols: number;
  volumeHoldover: number;
  isNew?: boolean;
};

export default function ManageLFAReagentPlatesPage() {
  const queryClient = useQueryClient();
  const { data: reagentPlates = [], isLoading } = useLFAReagentPlates();
  const [editState, setEditState] = useState<EditState | null>(null);

  const addMutation = useMutation({
    mutationFn: createLFAReagentPlate,
    onSuccess: (newReagentPlate) => {
      queryClient.setQueryData(['lfa-reagent-plates'], (oldPlates: ReagentPlate[] = []) => {
        return [newReagentPlate, ...oldPlates];
      });
      toast.success('Reagent plate added successfully');
      setEditState(null);
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 409) {
        toast.error('A reagent plate with this name already exists');
      } else if (error.response?.status === 400) {
        toast.error('Invalid input data');
      } else {
        toast.error('Failed to add reagent plate');
        console.error('Error adding reagent plate:', error);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateReagentPlate }) =>
      updateLFAReagentPlate(id, data),
    onSuccess: (updatedReagentPlate) => {
      queryClient.setQueryData(['lfa-reagent-plates'], (oldPlates: ReagentPlate[] = []) => {
        return oldPlates.map((plate) =>
          plate.id === updatedReagentPlate.id ? updatedReagentPlate : plate
        );
      });
      toast.success('Reagent plate updated successfully');
      setEditState(null);
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 409) {
        toast.error('A reagent plate with this name already exists');
      } else if (error.response?.status === 400) {
        toast.error('Invalid input data');
      } else if (error.response?.status === 404) {
        toast.error('Reagent plate not found');
      } else {
        toast.error('Failed to update reagent plate');
        console.error('Error updating reagent plate:', error);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLFAReagentPlate,
    onSuccess: (_, id) => {
      queryClient.setQueryData(['lfa-reagent-plates'], (oldPlates: ReagentPlate[] = []) =>
        oldPlates.filter((plate) => plate.id !== id)
      );
      toast.success('Reagent plate deleted successfully');
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 404) {
        toast.error('Reagent plate not found');
      } else {
        toast.error('Failed to delete reagent plate');
        console.error('Error deleting reagent plate:', error);
      }
    },
  });

  const handleAddReagentPlate = () => {
    const newId = `NEW_${Date.now()}`;
    const newPlate = {
      id: newId,
      plate: '',
      volumeWell: 0,
      numRows: 0,
      numCols: 0,
      volumeHoldover: 0,
      isNew: true,
    };
    setEditState(newPlate);
  };

  const handleEdit = (plate: EditState) => {
    setEditState({
      id: plate.id,
      plate: plate.plate,
      volumeWell: plate.volumeWell,
      numRows: plate.numRows,
      numCols: plate.numCols,
      volumeHoldover: plate.volumeHoldover,
    });
  };

  const handleCancelEdit = () => {
    setEditState(null);
  };

  const handleSaveEdit = async () => {
    if (!editState) return;

    const { plate, volumeWell, numRows, numCols, volumeHoldover } = editState;

    if (!plate.trim() || volumeWell <= 0 || numRows <= 0 || numCols <= 0 || volumeHoldover < 0) {
      toast.error('Please fill in all fields with valid values');
      return;
    }

    // Check for duplicate plate name, excluding the current item being edited
    const isDuplicate = reagentPlates.some(
      (rp) => rp.plate.toLowerCase() === plate.toLowerCase() && rp.id !== editState.id
    );

    if (isDuplicate) {
      toast.error('A reagent plate with this name already exists');
      return;
    }

    const data = {
      plate,
      volumeWell,
      numRows,
      numCols,
      volumeHoldover,
    };

    if (editState.isNew) {
      addMutation.mutate(data);
    } else {
      updateMutation.mutate({ id: editState.id, data });
    }
  };

  const handleDelete = (plate: EditState) => {
    deleteMutation.mutate(plate.id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reagent Plates</h2>
        <Button onClick={handleAddReagentPlate} disabled={!!editState}>
          <Plus className="mr-2 h-4 w-4" />
          Add Reagent Plate
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plate Name</TableHead>
            <TableHead>Well Volume (µL)</TableHead>
            <TableHead>Rows</TableHead>
            <TableHead>Columns</TableHead>
            <TableHead>Holdover Volume (µL)</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {editState?.isNew && (
            <TableRow>
              <TableCell>
                <Input
                  value={editState.plate}
                  onChange={(e) =>
                    setEditState((prev) => (prev ? { ...prev, plate: e.target.value } : null))
                  }
                  placeholder="Enter plate name"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={editState.volumeWell}
                  onChange={(e) =>
                    setEditState((prev) =>
                      prev ? { ...prev, volumeWell: Number(e.target.value) } : null
                    )
                  }
                  placeholder="Enter well volume"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={editState.numRows}
                  onChange={(e) =>
                    setEditState((prev) =>
                      prev ? { ...prev, numRows: Number(e.target.value) } : null
                    )
                  }
                  placeholder="Enter rows"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={editState.numCols}
                  onChange={(e) =>
                    setEditState((prev) =>
                      prev ? { ...prev, numCols: Number(e.target.value) } : null
                    )
                  }
                  placeholder="Enter columns"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={editState.volumeHoldover}
                  onChange={(e) =>
                    setEditState((prev) =>
                      prev ? { ...prev, volumeHoldover: Number(e.target.value) } : null
                    )
                  }
                  placeholder="Enter holdover volume"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
          {reagentPlates.map((plate) => (
            <TableRow key={plate.id}>
              <TableCell>
                {editState?.id === plate.id ? (
                  <Input
                    value={editState.plate}
                    onChange={(e) =>
                      setEditState((prev) => (prev ? { ...prev, plate: e.target.value } : null))
                    }
                  />
                ) : (
                  plate.plate
                )}
              </TableCell>
              <TableCell>
                {editState?.id === plate.id ? (
                  <Input
                    type="number"
                    value={editState.volumeWell}
                    onChange={(e) =>
                      setEditState((prev) =>
                        prev ? { ...prev, volumeWell: Number(e.target.value) } : null
                      )
                    }
                  />
                ) : (
                  plate.volumeWell
                )}
              </TableCell>
              <TableCell>
                {editState?.id === plate.id ? (
                  <Input
                    type="number"
                    value={editState.numRows}
                    onChange={(e) =>
                      setEditState((prev) =>
                        prev ? { ...prev, numRows: Number(e.target.value) } : null
                      )
                    }
                  />
                ) : (
                  plate.numRows
                )}
              </TableCell>
              <TableCell>
                {editState?.id === plate.id ? (
                  <Input
                    type="number"
                    value={editState.numCols}
                    onChange={(e) =>
                      setEditState((prev) =>
                        prev ? { ...prev, numCols: Number(e.target.value) } : null
                      )
                    }
                  />
                ) : (
                  plate.numCols
                )}
              </TableCell>
              <TableCell>
                {editState?.id === plate.id ? (
                  <Input
                    type="number"
                    value={editState.volumeHoldover}
                    onChange={(e) =>
                      setEditState((prev) =>
                        prev ? { ...prev, volumeHoldover: Number(e.target.value) } : null
                      )
                    }
                  />
                ) : (
                  plate.volumeHoldover
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {editState?.id === plate.id ? (
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
                        onClick={() => handleEdit(plate)}
                        disabled={!!editState}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(plate)}
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
