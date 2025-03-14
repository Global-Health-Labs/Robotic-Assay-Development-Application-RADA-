import { LFAStep, useLFAExperiment } from '@/api/lfa-experiments.api';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useLFALiquidTypes } from '@/hooks/useLFALiquidTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { size } from 'lodash-es';
import { PlusCircle } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { LFAStepItem } from './LFAStepItem';
import { SortableStepRow } from './SortableStepRow';

const COLUMN_HEADERS = [
  {
    title: 'Location',
    tooltip: 'The location (DX, DZ) where the step will be performed',
  },
  {
    title: 'Volume',
    tooltip: 'The volume to be dispensed or aspirated',
  },
  {
    title: 'Liquid Type',
    tooltip: 'The type of liquid being handled in this step',
  },
  {
    title: 'Time',
    tooltip: 'The time in seconds for this step',
  },
];

const stepSchema = z.object({
  step: z.string().min(1, 'Step name is required'),
  location: z.string().min(1, 'Location is required'),
  volume: z.number().min(0, 'Volume must be a positive number'),
  liquidClass: z.string().min(1, 'Liquid type is required'),
  time: z.number().min(-1000, 'Invalid time'),
  source: z.string().min(1, 'At least one source is required'),
});

const formSchema = z.object({
  steps: z.array(stepSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface LFAStepsFormProps {
  onSubmit: (values: { steps: LFAStep[] }) => void;
  onBack: () => void;
  experimentId: string;
}

export function LFAStepsForm({ onSubmit, onBack, experimentId }: LFAStepsFormProps) {
  const { data: experimentData } = useLFAExperiment(experimentId);

  const plateConfig = experimentData?.deckLayout.assayPlateConfig;
  const locations = plateConfig?.locations || [];
  const steps = experimentData?.steps || [];

  const { data: liquidTypes = [] } = useLFALiquidTypes();

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const defaultStep = {
    step: '',
    location: '',
    volume: 0,
    liquidClass: '',
    time: 0,
    source: '',
  };

  // Transform incoming steps to form format (with location string instead of dx/dz)
  const initialSteps =
    size(steps) > 0
      ? steps?.map((step) => ({
          step: step.step,
          location: `${step.dx},${step.dz}`,
          volume: step.volume,
          liquidClass: step.liquidClass,
          time: step.time,
          source: step.source,
        }))
      : [defaultStep];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      steps: initialSteps,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'steps',
  });

  // Handle drag end event
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // Find the indices of the items being dragged
      const activeIndex = fields.findIndex((item) => item.id === active.id);
      const overIndex = fields.findIndex((item) => item.id === over.id);

      // Move the item in the form's field array
      move(activeIndex, overIndex);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      // Transform the form values to include dx and dz from the selected location
      const transformedSteps = values.steps.map((step) => {
        const [dx, dz] = step.location.split(',').map(Number);
        return {
          step: step.step,
          dx,
          dz,
          volume: step.volume,
          liquidClass: step.liquidClass,
          time: step.time,
          source: step.source, // This is already a comma-separated string
        };
      });

      // Save steps
      await onSubmit({ steps: transformedSteps });
    } catch (error) {
      console.error('Error saving steps:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="relative space-y-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, index) => (
                <SortableStepRow key={field.id} id={field.id}>
                  <LFAStepItem
                    index={index}
                    canDelete={fields.length > 1}
                    onDelete={() => remove(index)}
                    locations={locations}
                    liquidTypes={liquidTypes}
                    columnHeaders={COLUMN_HEADERS}
                  />
                </SortableStepRow>
              ))}
            </SortableContext>
          </DndContext>

          <div className="flex w-full justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  step: '',
                  location: '',
                  volume: 0,
                  liquidClass: '',
                  time: 0,
                  source: '',
                })
              }
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Step
            </Button>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Save and Continue</Button>
        </div>
      </form>
    </Form>
  );
}
