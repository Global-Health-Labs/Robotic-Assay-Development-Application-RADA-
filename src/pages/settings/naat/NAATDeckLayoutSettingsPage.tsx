import axios from '@/api/axios';
import { PLATE_LAYOUT_NAME } from '@/components/naat-instruction-viewer/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PlateItem {
  id: keyof typeof PLATE_LAYOUT_NAME;
  name: string;
  isEmpty?: boolean;
  wellCount: WellCount;
  plateDescriptor: PlateDescriptor;
  sequenceNumber: string;
}

type WellCount = 1 | 96 | 384;
type PlateDescriptor = 'PCR' | 'Flat' | 'DW' | 'V';

const WELL_COUNT_OPTIONS: WellCount[] = [1, 96, 384];
const PLATE_DESCRIPTOR_OPTIONS: PlateDescriptor[] = ['PCR', 'Flat', 'DW', 'V'];

function generateSequenceNumber(count: number): string {
  return count.toString().padStart(4, '0');
}

function generatePlateName(
  wellCount: WellCount,
  plateDescriptor: PlateDescriptor,
  sequenceNumber: string
): string {
  return `${wellCount}_${plateDescriptor}_${sequenceNumber}`;
}

const defaultPlates: PlateItem[] = Array.from({ length: 15 }, (_, index) => {
  // For demo purposes, assign some default values
  const wellCount: WellCount = 96;
  const plateDescriptor: PlateDescriptor = 'Flat';
  const sequenceNumber = generateSequenceNumber(index + 1);

  return {
    id: `PLATE_${index}` as keyof typeof PLATE_LAYOUT_NAME,
    name: generatePlateName(wellCount, plateDescriptor, sequenceNumber),
    wellCount,
    plateDescriptor,
    sequenceNumber,
    isEmpty: false,
  };
});

interface DeckLayout {
  id: string;
  name: string;
  description?: string;
  platePositions: PlateItem[];
  createdAt: string;
  updatedAt: string;
  creator?: {
    fullname: string;
  };
}

function SortablePlate({
  plate,
  onSetEmpty,
  onUpdatePlate,
}: {
  plate: PlateItem;
  onSetEmpty: (id: string, isEmpty: boolean) => void;
  onUpdatePlate: (id: string, updates: Partial<PlateItem>) => void;
}) {
  const { attributes, isDragging, listeners, node, setNodeRef, transform, transition } =
    useSortable({
      id: plate.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isDragging && node?.current) {
      (node.current as HTMLDivElement).classList.add('!bg-secondary', '!text-secondary-foreground');
    } else {
      setTimeout(() => {
        (node.current as HTMLDivElement).classList.remove(
          '!bg-secondary',
          '!text-secondary-foreground'
        );
      }, 500);
    }
  }, [isDragging, node]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'transition-[colors, shadow] rounded-lg border bg-white p-4 shadow-sm ease-in-out hover:shadow-md'
      )}
    >
      <div {...listeners} className="cursor-move">
        {plate.isEmpty ? 'EMPTY' : plate.name}
      </div>
      <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <select
            value={plate.wellCount}
            onChange={(e) =>
              onUpdatePlate(plate.id, { wellCount: Number(e.target.value) as WellCount })
            }
            className="rounded border p-1 text-xs"
            disabled={plate.isEmpty}
          >
            {WELL_COUNT_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count} Wells
              </option>
            ))}
          </select>
          <select
            value={plate.plateDescriptor}
            onChange={(e) =>
              onUpdatePlate(plate.id, { plateDescriptor: e.target.value as PlateDescriptor })
            }
            className="rounded border p-1 text-xs"
            disabled={plate.isEmpty}
          >
            {PLATE_DESCRIPTOR_OPTIONS.map((descriptor) => (
              <option key={descriptor} value={descriptor}>
                {descriptor}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`empty-${plate.id}`}
            checked={plate.isEmpty}
            onChange={(e) => onSetEmpty(plate.id, e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor={`empty-${plate.id}`} className="text-xs">
            Set Empty
          </label>
        </div>
      </div>
    </div>
  );
}

interface LayoutEditorProps {
  layout?: DeckLayout;
  onClose: () => void;
}

function LayoutEditor({ layout, onClose }: LayoutEditorProps) {
  const [plates, setPlates] = useState<PlateItem[]>(layout?.platePositions || defaultPlates);
  const [name, setName] = useState(layout?.name || '');
  const [description, setDescription] = useState(layout?.description || '');
  const sensors = useSensors(useSensor(PointerSensor));
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: Omit<DeckLayout, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await axios.post('/settings/naat/deck-layouts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deck-layouts'] });
      toast.success('Deck layout created successfully');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create deck layout');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Omit<DeckLayout, 'createdAt' | 'updatedAt'>) => {
      const response = await axios.put(`/settings/naat/deck-layouts/${data.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deck-layouts'] });
      toast.success('Deck layout updated successfully');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update deck layout');
    },
  });

  const updateSequenceNumbers = (updatedPlates: PlateItem[]) => {
    const counters = new Map<string, number>();

    return updatedPlates.map((plate) => {
      if (plate.isEmpty) return plate;

      const key = `${plate.wellCount}_${plate.plateDescriptor}`;
      const count = (counters.get(key) || 0) + 1;
      counters.set(key, count);

      const sequenceNumber = generateSequenceNumber(count);
      return {
        ...plate,
        sequenceNumber,
        name: generatePlateName(plate.wellCount, plate.plateDescriptor, sequenceNumber),
      };
    });
  };

  const handleSetEmpty = (id: string, isEmpty: boolean) => {
    setPlates((prevPlates) => {
      const updatedPlates = prevPlates.map((plate) =>
        plate.id === id ? { ...plate, isEmpty } : plate
      );
      return updateSequenceNumbers(updatedPlates);
    });
  };

  const handleUpdatePlate = (id: string, updates: Partial<PlateItem>) => {
    setPlates((prevPlates) => {
      const updatedPlates = prevPlates.map((plate) =>
        plate.id === id ? { ...plate, ...updates } : plate
      );
      return updateSequenceNumbers(updatedPlates);
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPlates((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reorderedPlates = arrayMove(items, oldIndex, newIndex);
        return updateSequenceNumbers(reorderedPlates);
      });
    }
  };

  const handleSave = () => {
    if (!name) {
      toast.error('Name is required');
      return;
    }

    const data = {
      name,
      description,
      platePositions: plates.map((plate, index) => ({
        ...plate,
        position: index,
      })),
    };

    if (layout?.id) {
      updateMutation.mutate({ ...data, id: layout.id });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter layout name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter layout description"
          />
        </div>
      </div>

      <Card className="p-6">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-3 gap-4">
            <SortableContext items={plates}>
              {plates.map((plate) => (
                <SortablePlate
                  key={plate.id}
                  plate={plate}
                  onSetEmpty={handleSetEmpty}
                  onUpdatePlate={handleUpdatePlate}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          Save Layout
        </Button>
      </div>
    </div>
  );
}

const DeckLayoutSettingsPage: React.FC = () => {
  const [selectedLayout, setSelectedLayout] = useState<DeckLayout | undefined>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { data: layouts } = useQuery({
    queryKey: ['deck-layouts'],
    queryFn: async () => {
      const response = await axios.get('/settings/naat/deck-layouts');
      return response.data as DeckLayout[];
    },
  });

  const handleEdit = (layout: DeckLayout) => {
    setSelectedLayout(layout);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setSelectedLayout(undefined);
    setIsEditorOpen(true);
  };

  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Deck Layout Settings</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage deck layouts for your experiments.
          </p>
        </div>
        <Button onClick={handleCreate}>Create New Layout</Button>
      </div>

      <div className="grid gap-4">
        {(layouts || []).map((layout) => (
          <Card key={layout.id} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{layout.name}</h3>
                {layout.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{layout.description}</p>
                )}
                <div className="mt-2 text-sm text-muted-foreground">
                  Created by {layout.creator?.fullname || 'Unknown'} on{' '}
                  {new Date(layout.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Button variant="outline" onClick={() => handleEdit(layout)}>
                Edit Layout
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedLayout ? 'Edit Layout' : 'Create New Layout'}</DialogTitle>
          </DialogHeader>
          <LayoutEditor layout={selectedLayout} onClose={() => setIsEditorOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeckLayoutSettingsPage;
