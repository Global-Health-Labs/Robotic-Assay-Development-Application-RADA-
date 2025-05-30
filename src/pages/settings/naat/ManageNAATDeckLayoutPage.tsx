import axios from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import NAATSortablePlate from '@/pages/settings/naat/NAATSortablePlate';
import {
  createDefaultPlates,
  generatePlateName,
  generateSequenceNumber,
} from '@/pages/settings/util/deck-layout.util';
import { PlateItem } from '@/types/plate.types';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { isNaN, isNumber } from 'lodash-es';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const defaultPlates: PlateItem[] = createDefaultPlates();

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

interface LayoutEditorProps {
  layout?: DeckLayout;
  onClose: () => void;
}

const layoutFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type LayoutFormValues = z.infer<typeof layoutFormSchema>;

function LayoutEditor({ layout, onClose }: LayoutEditorProps) {
  const form = useForm<LayoutFormValues>({
    resolver: zodResolver(layoutFormSchema),
    defaultValues: {
      name: layout?.name ?? '',
      description: layout?.description ?? '',
    },
  });
  const [plates, setPlates] = useState<PlateItem[]>(layout?.platePositions ?? defaultPlates);
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
    onError: (error: AxiosError) => {
      const data = error.response?.data as { message: string };
      toast.error(data?.message || 'Failed to create deck layout');
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
    onError: (error: AxiosError) => {
      const data = error.response?.data as { message: string };
      toast.error(data?.message || 'Failed to update deck layout');
    },
  });

  const sensors = useSensors(useSensor(PointerSensor));

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

  const onSubmit = (values: LayoutFormValues) => {
    const data = {
      ...values,
      platePositions: plates.map((plate, index) => ({
        ...plate,
        holdoverVolumeFactor:
          plate.holdoverVolumeFactor &&
          isNumber(plate.holdoverVolumeFactor) &&
          !isNaN(plate.holdoverVolumeFactor) &&
          plate.holdoverVolumeFactor > 0
            ? plate.holdoverVolumeFactor
            : 1,
        position: index,
      })),
    };

    if (layout) {
      updateMutation.mutate({ ...data, id: layout.id });
    } else {
      createMutation.mutate(data);
    }
  };

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-4 overflow-hidden"
      >
        <div className="flex flex-col gap-4 overflow-y-auto px-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2">
            <Label>Plate Positions</Label>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext items={plates.map((plate) => plate.id)}>
                <div className="grid grid-cols-3 gap-4">
                  {plates.map((plate) => (
                    <NAATSortablePlate
                      key={plate.id}
                      plate={plate}
                      onSetEmpty={(id, isEmpty) => handleSetEmpty(id, isEmpty)}
                      onUpdatePlate={(id, updates) => handleUpdatePlate(id, updates)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {layout ? 'Update Layout' : 'Create Layout'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

const ManageNAATDeckLayoutPage: React.FC = () => {
  const [selectedLayout, setSelectedLayout] = useState<DeckLayout | undefined>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { data: layouts } = useQuery({
    queryKey: ['deck-layouts'],
    queryFn: async () => {
      const response = await axios.get('/experiments/naat/deck-layouts');
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
                <div className="mt-2 text-xs text-muted-foreground">
                  Created by {layout.creator?.fullname || 'Unknown'} on{' '}
                  {dayjs(layout.createdAt).format('MMM DD, YYYY')}
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
        <DialogContent className="flex max-h-[100vh] max-w-6xl flex-col overflow-hidden p-4 sm:max-h-[98vh]">
          <DialogHeader>
            <DialogTitle>{selectedLayout ? 'Edit Layout' : 'Create New Layout'}</DialogTitle>
          </DialogHeader>
          <LayoutEditor layout={selectedLayout} onClose={() => setIsEditorOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageNAATDeckLayoutPage;
