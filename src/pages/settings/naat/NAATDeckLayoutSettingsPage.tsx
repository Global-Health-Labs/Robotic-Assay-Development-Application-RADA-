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
}

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

const defaultPlates: PlateItem[] = [
  { id: 'IVL_96_FLAT_01', name: '96 Flat 01' },
  { id: 'IVL_96_FLAT_02', name: '96 Flat 02' },
  { id: 'IVL_96_DW_01', name: '96 DW 01' },
  { id: 'IVL_96_DW_02', name: '96 DW 02' },
  { id: 'IVL_96_FLAT_03', name: '96 Flat 03' },
  { id: 'PCR_COOLER_01', name: 'PCR Cooler 01' },
  { id: 'PCR_COOLER_02', name: 'PCR Cooler 02' },
  { id: 'PCR_COOLER_03', name: 'PCR Cooler 03' },
  { id: 'IVL_384_FLAT_01', name: '384 Flat 01' },
  { id: 'IVL_384_FLAT_02', name: '384 Flat 02' },
  { id: 'IVL_96_TEMPLATE_01', name: '96 Template 01' },
  { id: 'PCR_COOLER_04', name: 'PCR Cooler 04' },
  { id: 'PCR_COOLER_05', name: 'PCR Cooler 05' },
  { id: 'PCR_COOLER_06', name: 'PCR Cooler 06' },
  { id: 'PCR_COOLER_07', name: 'PCR Cooler 07' },
];

function SortablePlate({ plate }: { plate: PlateItem }) {
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
      {...listeners}
      className={cn(
        'transition-[colors, shadow] cursor-move rounded-lg border bg-white p-4 shadow-sm ease-in-out hover:shadow-md'
      )}
    >
      {plate.name}
      <div className="mt-1 text-xs">{PLATE_LAYOUT_NAME[plate.id]}</div>
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPlates((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

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
                <SortablePlate key={plate.id} plate={plate} />
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

  const { data: layouts, isLoading } = useQuery({
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
